use proc_macro2::TokenStream;
use quote::quote;

use crate::ir::{float_strategy, int_strategy, FloatStrategy, IntInfo, IntStrategy, Type};

pub struct Field {
    pub ident: syn::Ident,
    pub ty: Type,
}

pub struct Variant {
    pub ident: syn::Ident,
    pub inner_path: syn::Path,
}

struct Ctx<'a> {
    self_name: &'a syn::Ident,
}

impl<'a> Ctx<'a> {
    fn self_tok(&self) -> TokenStream {
        let n = self.self_name;
        quote! { #n }
    }
}

pub fn emit_struct(name: &syn::Ident, fields: &[Field]) -> TokenStream {
    let ctx = Ctx { self_name: name };
    let default_body = default_body(&ctx, fields);
    let equals_body = equals_body(&ctx, fields);
    let encode_body = encode_body(&ctx, fields);
    let encode_diff_body = encode_diff_body(&ctx, fields);
    let decode_body = decode_body(&ctx, fields);
    let decode_diff_body = decode_diff_body(&ctx, fields);

    quote! {
        impl ::core::default::Default for #name {
            fn default() -> Self {
                Self { #default_body }
            }
        }

        impl ::delta_pack::DeltaPack for #name {
            fn equals(&self, other: &Self) -> bool {
                #equals_body
            }

            fn encode_into(&self, encoder: &mut ::delta_pack::Encoder) {
                #encode_body
            }

            fn decode_from(decoder: &mut ::delta_pack::Decoder) -> Self {
                Self { #decode_body }
            }

            fn encode_diff_into(a: &Self, b: &Self, encoder: &mut ::delta_pack::Encoder) {
                #encode_diff_body
            }

            fn decode_diff_from(obj: &Self, decoder: &mut ::delta_pack::Decoder) -> Self {
                Self { #decode_diff_body }
            }

            fn encode_diff(a: &Self, b: &Self) -> ::std::vec::Vec<u8> {
                ::delta_pack::Encoder::encode(|encoder| {
                    encoder.push_object_diff(a, b, |x, y| <Self as ::delta_pack::DeltaPack>::equals(x, y), |enc| {
                        <Self as ::delta_pack::DeltaPack>::encode_diff_into(a, b, enc);
                    });
                    encoder.finish()
                })
            }

            fn decode_diff(obj: &Self, diff: &[u8]) -> Self {
                ::delta_pack::Decoder::decode(diff, |decoder| {
                    decoder.next_object_diff(obj, |dec| <Self as ::delta_pack::DeltaPack>::decode_diff_from(obj, dec))
                })
            }
        }
    }
}

pub fn emit_c_enum(name: &syn::Ident, variants: &[syn::Ident]) -> TokenStream {
    let num = variants.len();
    let num_bits: u8 = if num <= 1 {
        1
    } else {
        ((num as f64).log2().ceil()) as u8
    };

    let from_cases = variants.iter().enumerate().map(|(i, id)| {
        let i_lit = i as u32;
        quote! { #i_lit => ::core::option::Option::Some(#name::#id), }
    });
    let to_cases = variants.iter().enumerate().map(|(i, id)| {
        let i_lit = i as u32;
        quote! { #name::#id => #i_lit, }
    });
    let first = &variants[0];

    quote! {
        impl ::delta_pack::__private::Sealed for #name {}
        impl ::delta_pack::__private::EnumRepr for #name {
            const NUM_BITS: u8 = #num_bits;

            fn to_u32(self) -> u32 {
                match self {
                    #(#to_cases)*
                }
            }

            fn try_from_u32(val: u32) -> ::core::option::Option<Self> {
                match val {
                    #(#from_cases)*
                    _ => ::core::option::Option::None,
                }
            }
        }

        impl ::core::default::Default for #name {
            fn default() -> Self {
                #name::#first
            }
        }

        impl ::delta_pack::DeltaPack for #name {
            fn equals(&self, other: &Self) -> bool {
                ::core::mem::discriminant(self) == ::core::mem::discriminant(other)
            }

            fn encode_into(&self, encoder: &mut ::delta_pack::Encoder) {
                encoder.push_enum(
                    <Self as ::delta_pack::__private::EnumRepr>::to_u32(*self),
                    <Self as ::delta_pack::__private::EnumRepr>::NUM_BITS,
                );
            }

            fn decode_from(decoder: &mut ::delta_pack::Decoder) -> Self {
                let val = decoder.next_enum(<Self as ::delta_pack::__private::EnumRepr>::NUM_BITS);
                <Self as ::delta_pack::__private::EnumRepr>::try_from_u32(val)
                    .unwrap_or_else(|| panic!(concat!("Invalid ", stringify!(#name), " value: {}"), val))
            }

            fn encode_diff_into(a: &Self, b: &Self, encoder: &mut ::delta_pack::Encoder) {
                encoder.push_enum_diff(
                    <Self as ::delta_pack::__private::EnumRepr>::to_u32(*a),
                    <Self as ::delta_pack::__private::EnumRepr>::to_u32(*b),
                    <Self as ::delta_pack::__private::EnumRepr>::NUM_BITS,
                );
            }

            fn decode_diff_from(obj: &Self, decoder: &mut ::delta_pack::Decoder) -> Self {
                let val = decoder.next_enum_diff(
                    <Self as ::delta_pack::__private::EnumRepr>::to_u32(*obj),
                    <Self as ::delta_pack::__private::EnumRepr>::NUM_BITS,
                );
                <Self as ::delta_pack::__private::EnumRepr>::try_from_u32(val)
                    .unwrap_or_else(|| panic!(concat!("Invalid ", stringify!(#name), " value: {}"), val))
            }
        }
    }
}

pub fn emit_union(name: &syn::Ident, variants: &[Variant]) -> TokenStream {
    let num = variants.len();
    let num_bits: u8 = if num <= 1 {
        1
    } else {
        ((num as f64).log2().ceil()) as u8
    };

    let first = &variants[0];
    let first_ident = &first.ident;
    let first_path = &first.inner_path;

    let equals_cases = variants.iter().map(|v| {
        let id = &v.ident;
        let path = &v.inner_path;
        quote! {
            (#name::#id(a), #name::#id(b)) => <#path as ::delta_pack::DeltaPack>::equals(a, b),
        }
    });

    let encode_cases = variants.iter().enumerate().map(|(i, v)| {
        let id = &v.ident;
        let path = &v.inner_path;
        let i_lit = i as u32;
        quote! {
            #name::#id(val) => {
                encoder.push_enum(#i_lit, #num_bits);
                <#path as ::delta_pack::DeltaPack>::encode_into(val, encoder);
            }
        }
    });

    let encode_diff_cases = variants.iter().enumerate().map(|(i, v)| {
        let id = &v.ident;
        let path = &v.inner_path;
        let i_lit = i as u32;
        quote! {
            #name::#id(b_val) => {
                if let #name::#id(a_val) = a {
                    <#path as ::delta_pack::DeltaPack>::encode_diff_into(a_val, b_val, encoder);
                } else {
                    encoder.push_enum(#i_lit, #num_bits);
                    <#path as ::delta_pack::DeltaPack>::encode_into(b_val, encoder);
                }
            }
        }
    });

    let decode_cases = variants.iter().enumerate().map(|(i, v)| {
        let id = &v.ident;
        let path = &v.inner_path;
        let i_lit = i as u32;
        quote! {
            #i_lit => #name::#id(<#path as ::delta_pack::DeltaPack>::decode_from(decoder)),
        }
    });

    let decode_diff_same = variants.iter().map(|v| {
        let id = &v.ident;
        let path = &v.inner_path;
        quote! {
            #name::#id(v) => #name::#id(
                <#path as ::delta_pack::DeltaPack>::decode_diff_from(v, decoder)
            ),
        }
    });
    let decode_diff_new = variants.iter().enumerate().map(|(i, v)| {
        let id = &v.ident;
        let path = &v.inner_path;
        let i_lit = i as u32;
        quote! {
            #i_lit => #name::#id(<#path as ::delta_pack::DeltaPack>::decode_from(decoder)),
        }
    });

    quote! {
        impl ::core::default::Default for #name {
            fn default() -> Self {
                #name::#first_ident(<#first_path as ::core::default::Default>::default())
            }
        }

        impl ::delta_pack::DeltaPack for #name {
            fn equals(&self, other: &Self) -> bool {
                match (self, other) {
                    #(#equals_cases)*
                    _ => false,
                }
            }

            fn encode_into(&self, encoder: &mut ::delta_pack::Encoder) {
                match self {
                    #(#encode_cases)*
                }
            }

            fn decode_from(decoder: &mut ::delta_pack::Decoder) -> Self {
                let variant = decoder.next_enum(#num_bits);
                match variant {
                    #(#decode_cases)*
                    _ => panic!(concat!("Invalid ", stringify!(#name), " variant: {}"), variant),
                }
            }

            fn encode_diff_into(a: &Self, b: &Self, encoder: &mut ::delta_pack::Encoder) {
                let same_type = ::core::mem::discriminant(a) == ::core::mem::discriminant(b);
                encoder.push_boolean(same_type);
                match b {
                    #(#encode_diff_cases)*
                }
            }

            fn decode_diff_from(obj: &Self, decoder: &mut ::delta_pack::Decoder) -> Self {
                let same_type = decoder.next_boolean();
                if same_type {
                    match obj {
                        #(#decode_diff_same)*
                    }
                } else {
                    let variant = decoder.next_enum(#num_bits);
                    match variant {
                        #(#decode_diff_new)*
                        _ => panic!(concat!("Invalid ", stringify!(#name), " variant: {}"), variant),
                    }
                }
            }
        }
    }
}

fn default_body(ctx: &Ctx, fields: &[Field]) -> TokenStream {
    let parts = fields.iter().map(|f| {
        let id = &f.ident;
        let val = render_default(ctx, &f.ty);
        quote! { #id: #val, }
    });
    quote! { #(#parts)* }
}

fn render_default(ctx: &Ctx, t: &Type) -> TokenStream {
    match t {
        Type::String => quote! { ::std::string::String::new() },
        Type::Int(info) => {
            let ty = info.storage.as_ty();
            quote! { 0 as #ty }
        }
        Type::Float { .. } => quote! { 0.0 },
        Type::Boolean => quote! { false },
        Type::Array(_) => quote! { ::std::vec::Vec::new() },
        Type::Optional(_) => quote! { ::core::option::Option::None },
        Type::Record { .. } => quote! { ::delta_pack::IndexMap::new() },
        Type::Reference(path) => quote! { <#path as ::core::default::Default>::default() },
        Type::SelfReference => {
            let s = ctx.self_tok();
            quote! { ::std::boxed::Box::new(<#s as ::core::default::Default>::default()) }
        }
    }
}

fn equals_body(ctx: &Ctx, fields: &[Field]) -> TokenStream {
    if fields.is_empty() {
        return quote! { true };
    }
    let parts: Vec<TokenStream> = fields
        .iter()
        .map(|f| {
            let id = &f.ident;
            let a = quote! { self.#id };
            let b = quote! { other.#id };
            render_equals(ctx, &f.ty, &a, &b, false)
        })
        .collect();
    quote! { #(#parts)&&* }
}

fn render_equals(
    ctx: &Ctx,
    t: &Type,
    a: &TokenStream,
    b: &TokenStream,
    in_closure: bool,
) -> TokenStream {
    match t {
        Type::String | Type::Int(_) | Type::Boolean => quote! { #a == #b },
        Type::Float { precision } => {
            let (a_expr, b_expr) = if in_closure {
                (quote! { *#a }, quote! { *#b })
            } else {
                (quote! { #a }, quote! { #b })
            };
            match float_strategy(*precision) {
                FloatStrategy::Quantized { precision } => {
                    let lit = float_lit(precision);
                    quote! { ::delta_pack::equals_float_quantized(#a_expr, #b_expr, #lit) }
                }
                FloatStrategy::Full => {
                    quote! { ::delta_pack::equals_float(#a_expr, #b_expr) }
                }
            }
        }
        Type::Array(inner) => {
            if is_primitive(inner) {
                quote! { #a == #b }
            } else {
                let cb = render_equals_callback(ctx, inner);
                quote! { ::delta_pack::equals_array(&#a, &#b, #cb) }
            }
        }
        Type::Optional(inner) => {
            if is_primitive(inner) {
                quote! { #a == #b }
            } else {
                let cb = render_equals_callback(ctx, inner);
                quote! { ::delta_pack::equals_optional(&#a, &#b, #cb) }
            }
        }
        Type::Record { value, .. } => {
            if is_primitive(value) {
                quote! { #a == #b }
            } else {
                let cb = render_equals_callback(ctx, value);
                quote! { ::delta_pack::equals_record(&#a, &#b, #cb) }
            }
        }
        Type::Reference(path) => {
            let (a_ref, b_ref) = if in_closure {
                (quote! { #a }, quote! { #b })
            } else {
                (quote! { &#a }, quote! { &#b })
            };
            quote! { <#path as ::delta_pack::DeltaPack>::equals(#a_ref, #b_ref) }
        }
        Type::SelfReference => {
            let s = ctx.self_tok();
            let (a_ref, b_ref) = if in_closure {
                (quote! { #a }, quote! { #b })
            } else {
                (quote! { &#a }, quote! { &#b })
            };
            quote! { <#s as ::delta_pack::DeltaPack>::equals(#a_ref, #b_ref) }
        }
    }
}

fn render_equals_callback(ctx: &Ctx, t: &Type) -> TokenStream {
    match t {
        Type::String | Type::Int(_) | Type::Boolean => quote! { |x, y| x == y },
        Type::Float { precision } => match float_strategy(*precision) {
            FloatStrategy::Quantized { precision } => {
                let lit = float_lit(precision);
                quote! { |&x, &y| ::delta_pack::equals_float_quantized(x, y, #lit) }
            }
            FloatStrategy::Full => quote! { |&x, &y| ::delta_pack::equals_float(x, y) },
        },
        Type::Array(inner) => {
            if is_primitive(inner) {
                quote! { |x, y| x == y }
            } else {
                let inner_cb = render_equals_callback(ctx, inner);
                quote! { |x, y| ::delta_pack::equals_array(x, y, #inner_cb) }
            }
        }
        Type::Optional(inner) => {
            if is_primitive(inner) {
                quote! { |x, y| x == y }
            } else {
                let inner_cb = render_equals_callback(ctx, inner);
                quote! { |x, y| ::delta_pack::equals_optional(x, y, #inner_cb) }
            }
        }
        Type::Record { value, .. } => {
            if is_primitive(value) {
                quote! { |x, y| x == y }
            } else {
                let inner_cb = render_equals_callback(ctx, value);
                quote! { |x, y| ::delta_pack::equals_record(x, y, #inner_cb) }
            }
        }
        Type::Reference(path) => {
            quote! { |x, y| <#path as ::delta_pack::DeltaPack>::equals(x, y) }
        }
        Type::SelfReference => {
            let s = ctx.self_tok();
            quote! { |x, y| <#s as ::delta_pack::DeltaPack>::equals(x, y) }
        }
    }
}

fn is_primitive(t: &Type) -> bool {
    matches!(
        t,
        Type::String | Type::Int(_) | Type::Float { .. } | Type::Boolean
    )
}

fn is_copy(t: &Type) -> bool {
    matches!(t, Type::Int(_) | Type::Float { .. } | Type::Boolean)
}

fn encode_body(ctx: &Ctx, fields: &[Field]) -> TokenStream {
    let parts = fields.iter().map(|f| {
        let id = &f.ident;
        let key = quote! { self.#id };
        let expr = render_encode(ctx, &f.ty, &key);
        quote! { #expr; }
    });
    quote! { #(#parts)* }
}

fn render_encode(ctx: &Ctx, t: &Type, key: &TokenStream) -> TokenStream {
    match t {
        Type::String => quote! { encoder.push_string(&#key) },
        Type::Int(info) => render_int_encode(info, key, quote! { encoder }),
        Type::Float { precision } => match float_strategy(*precision) {
            FloatStrategy::Quantized { precision } => {
                let lit = float_lit(precision);
                quote! { encoder.push_float_quantized(#key, #lit) }
            }
            FloatStrategy::Full => quote! { encoder.push_float(#key) },
        },
        Type::Boolean => quote! { encoder.push_boolean(#key) },
        Type::Array(inner) => {
            let cb = render_encode_callback(ctx, inner);
            quote! { encoder.push_array(&#key, #cb) }
        }
        Type::Optional(inner) => {
            let cb = render_encode_callback(ctx, inner);
            quote! { encoder.push_optional(&#key, #cb) }
        }
        Type::Record { key: k, value } => {
            let kcb = render_encode_callback(ctx, k);
            let vcb = render_encode_callback(ctx, value);
            quote! { encoder.push_record(&#key, #kcb, #vcb) }
        }
        Type::Reference(path) => {
            quote! { <#path as ::delta_pack::DeltaPack>::encode_into(&#key, encoder) }
        }
        Type::SelfReference => {
            let s = ctx.self_tok();
            quote! { <#s as ::delta_pack::DeltaPack>::encode_into(&#key, encoder) }
        }
    }
}

fn render_int_encode(info: &IntInfo, key: &TokenStream, enc: TokenStream) -> TokenStream {
    match int_strategy(info) {
        IntStrategy::Packed {
            offset,
            max,
            num_bits,
        } => {
            let off = int_lit(offset);
            let mx = int_lit(max);
            let nb = num_bits;
            quote! { #enc.push_bit_packed_int(#key as i64, #off, #mx, #nb) }
        }
        IntStrategy::Unsigned { min } => {
            if min == 0 {
                quote! { #enc.push_uint(#key as u64) }
            } else {
                let mn = int_lit(min);
                quote! { #enc.push_uint((#key as u64) - (#mn as u64)) }
            }
        }
        IntStrategy::Signed => quote! { #enc.push_int(#key as i64) },
    }
}

fn render_encode_callback(ctx: &Ctx, t: &Type) -> TokenStream {
    match t {
        Type::String => quote! { |enc, item| enc.push_string(item) },
        Type::Int(info) => match int_strategy(info) {
            IntStrategy::Packed {
                offset,
                max,
                num_bits,
            } => {
                let off = int_lit(offset);
                let mx = int_lit(max);
                let nb = num_bits;
                quote! { |enc, &item| enc.push_bit_packed_int(item as i64, #off, #mx, #nb) }
            }
            IntStrategy::Unsigned { min } => {
                if min == 0 {
                    quote! { |enc, &item| enc.push_uint(item as u64) }
                } else {
                    let mn = int_lit(min);
                    quote! { |enc, &item| enc.push_uint((item as u64) - (#mn as u64)) }
                }
            }
            IntStrategy::Signed => quote! { |enc, &item| enc.push_int(item as i64) },
        },
        Type::Float { precision } => match float_strategy(*precision) {
            FloatStrategy::Quantized { precision } => {
                let lit = float_lit(precision);
                quote! { |enc, &item| enc.push_float_quantized(item, #lit) }
            }
            FloatStrategy::Full => quote! { |enc, &item| enc.push_float(item) },
        },
        Type::Boolean => quote! { |enc, &item| enc.push_boolean(item) },
        Type::Array(inner) => {
            let cb = render_encode_callback(ctx, inner);
            quote! { |enc, item| enc.push_array(item, #cb) }
        }
        Type::Optional(inner) => {
            let cb = render_encode_callback(ctx, inner);
            quote! { |enc, item| enc.push_optional(item, #cb) }
        }
        Type::Record { key, value } => {
            let kcb = render_encode_callback(ctx, key);
            let vcb = render_encode_callback(ctx, value);
            quote! { |enc, item| enc.push_record(item, #kcb, #vcb) }
        }
        Type::Reference(path) => {
            quote! { |enc, item| <#path as ::delta_pack::DeltaPack>::encode_into(item, enc) }
        }
        Type::SelfReference => {
            let s = ctx.self_tok();
            quote! { |enc, item| <#s as ::delta_pack::DeltaPack>::encode_into(item, enc) }
        }
    }
}

fn encode_diff_body(ctx: &Ctx, fields: &[Field]) -> TokenStream {
    let parts = fields.iter().map(|f| {
        let id = &f.ident;
        if has_own_change_bit(&f.ty) {
            let a = quote! { a.#id };
            let b = quote! { b.#id };
            let expr = render_encode_diff_direct(ctx, &f.ty, &a, &b);
            quote! { #expr; }
        } else {
            let eq_closure = render_equals_callback_inner(ctx, &f.ty);
            let diff_cb = render_encode_diff_callback(ctx, &f.ty);
            quote! {
                encoder.push_field_diff(&a.#id, &b.#id, #eq_closure, #diff_cb);
            }
        }
    });
    quote! { #(#parts)* }
}

fn render_equals_callback_inner(ctx: &Ctx, t: &Type) -> TokenStream {
    match t {
        Type::String | Type::Int(_) | Type::Boolean => quote! { |x, y| x == y },
        Type::Float { precision } => match float_strategy(*precision) {
            FloatStrategy::Quantized { precision } => {
                let lit = float_lit(precision);
                quote! { |x, y| ::delta_pack::equals_float_quantized(*x, *y, #lit) }
            }
            FloatStrategy::Full => quote! { |x, y| ::delta_pack::equals_float(*x, *y) },
        },
        Type::Array(inner) => {
            if is_primitive(inner) {
                quote! { |x, y| x == y }
            } else {
                let inner_cb = render_equals_callback(ctx, inner);
                quote! { |x, y| ::delta_pack::equals_array(&x, &y, #inner_cb) }
            }
        }
        Type::Optional(inner) => {
            if is_primitive(inner) {
                quote! { |x, y| x == y }
            } else {
                let inner_cb = render_equals_callback(ctx, inner);
                quote! { |x, y| ::delta_pack::equals_optional(&x, &y, #inner_cb) }
            }
        }
        Type::Record { value, .. } => {
            if is_primitive(value) {
                quote! { |x, y| x == y }
            } else {
                let inner_cb = render_equals_callback(ctx, value);
                quote! { |x, y| ::delta_pack::equals_record(&x, &y, #inner_cb) }
            }
        }
        Type::Reference(path) => {
            quote! { |x, y| <#path as ::delta_pack::DeltaPack>::equals(x, y) }
        }
        Type::SelfReference => {
            let s = ctx.self_tok();
            quote! { |x, y| <#s as ::delta_pack::DeltaPack>::equals(x, y) }
        }
    }
}

fn has_own_change_bit(t: &Type) -> bool {
    matches!(t, Type::Boolean)
}

fn render_encode_diff_direct(ctx: &Ctx, t: &Type, a: &TokenStream, b: &TokenStream) -> TokenStream {
    let a_arg = if is_copy(t) {
        quote! { #a }
    } else {
        quote! { &#a }
    };
    let b_arg = if is_copy(t) {
        quote! { #b }
    } else {
        quote! { &#b }
    };
    render_encode_diff_body(ctx, t, &a_arg, &b_arg, &quote! { encoder }, DiffCtx::Value)
}

#[derive(Copy, Clone)]
enum DiffCtx {
    Value,
    Element,
}

fn render_encode_diff_body(
    ctx: &Ctx,
    t: &Type,
    a: &TokenStream,
    b: &TokenStream,
    enc: &TokenStream,
    diff_ctx: DiffCtx,
) -> TokenStream {
    match t {
        Type::String => quote! { #enc.push_string_diff(#a, #b) },
        Type::Int(info) => match int_strategy(info) {
            IntStrategy::Packed {
                offset,
                max,
                num_bits,
            } => {
                let off = int_lit(offset);
                let mx = int_lit(max);
                let nb = num_bits;
                quote! { #enc.push_bit_packed_int_diff(#a as i64, #b as i64, #off, #mx, #nb) }
            }
            IntStrategy::Unsigned { min } => {
                if min == 0 {
                    quote! { #enc.push_uint_diff(#a as u64, #b as u64) }
                } else {
                    let mn = int_lit(min);
                    quote! { #enc.push_uint_diff((#a as u64) - (#mn as u64), (#b as u64) - (#mn as u64)) }
                }
            }
            IntStrategy::Signed => quote! { #enc.push_int_diff(#a as i64, #b as i64) },
        },
        Type::Float { precision } => match float_strategy(*precision) {
            FloatStrategy::Quantized { precision } => {
                let lit = float_lit(precision);
                quote! { #enc.push_float_quantized_diff(#a, #b, #lit) }
            }
            FloatStrategy::Full => quote! { #enc.push_float_diff(#a, #b) },
        },
        Type::Boolean => match diff_ctx {
            DiffCtx::Element => quote! { {} },
            DiffCtx::Value => quote! { #enc.push_boolean_diff(#a, #b) },
        },
        Type::Array(inner) => {
            let enc_cb = render_encode_callback(ctx, inner);
            let eq_cb = render_equals_callback(ctx, inner);
            let diff_cb = render_encode_diff_callback(ctx, inner);
            quote! { #enc.push_array_diff(#a, #b, #eq_cb, #enc_cb, #diff_cb) }
        }
        Type::Optional(inner) => {
            let enc_cb = render_encode_callback(ctx, inner);
            let diff_cb = render_encode_diff_callback(ctx, inner);
            quote! { #enc.push_optional_diff(#a, #b, #enc_cb, #diff_cb) }
        }
        Type::Record { key, value } => {
            let kcb = render_encode_callback(ctx, key);
            let vcb = render_encode_callback(ctx, value);
            let v_eq = render_equals_callback(ctx, value);
            let v_diff = render_encode_diff_callback(ctx, value);
            quote! { #enc.push_record_diff(#a, #b, #v_eq, #kcb, #vcb, #v_diff) }
        }
        Type::Reference(path) => {
            quote! { <#path as ::delta_pack::DeltaPack>::encode_diff_into(#a, #b, #enc) }
        }
        Type::SelfReference => {
            let s = ctx.self_tok();
            quote! { <#s as ::delta_pack::DeltaPack>::encode_diff_into(#a, #b, #enc) }
        }
    }
}

fn render_encode_diff_callback(ctx: &Ctx, t: &Type) -> TokenStream {
    let binder = if is_copy(t) {
        quote! { &a, &b }
    } else {
        quote! { a, b }
    };
    let body = render_encode_diff_body(
        ctx,
        t,
        &quote! { a },
        &quote! { b },
        &quote! { enc },
        DiffCtx::Element,
    );
    quote! { |enc, #binder| #body }
}

fn decode_body(ctx: &Ctx, fields: &[Field]) -> TokenStream {
    let parts = fields.iter().map(|f| {
        let id = &f.ident;
        let expr = render_decode(ctx, &f.ty);
        quote! { #id: #expr, }
    });
    quote! { #(#parts)* }
}

fn render_decode(ctx: &Ctx, t: &Type) -> TokenStream {
    match t {
        Type::String => quote! { decoder.next_string() },
        Type::Int(info) => render_int_decode(info, quote! { decoder }),
        Type::Float { precision } => match float_strategy(*precision) {
            FloatStrategy::Quantized { precision } => {
                let lit = float_lit(precision);
                quote! { decoder.next_float_quantized(#lit) }
            }
            FloatStrategy::Full => quote! { decoder.next_float() },
        },
        Type::Boolean => quote! { decoder.next_boolean() },
        Type::Array(inner) => {
            let cb = render_decode_callback(ctx, inner);
            quote! { decoder.next_array(#cb) }
        }
        Type::Optional(inner) => {
            let cb = render_decode_callback(ctx, inner);
            quote! { decoder.next_optional(#cb) }
        }
        Type::Record { key, value } => {
            let kcb = render_decode_callback(ctx, key);
            let vcb = render_decode_callback(ctx, value);
            quote! { decoder.next_record(#kcb, #vcb) }
        }
        Type::Reference(path) => {
            quote! { <#path as ::delta_pack::DeltaPack>::decode_from(decoder) }
        }
        Type::SelfReference => {
            let s = ctx.self_tok();
            quote! {
                ::std::boxed::Box::new(<#s as ::delta_pack::DeltaPack>::decode_from(decoder))
            }
        }
    }
}

fn render_int_decode(info: &IntInfo, dec: TokenStream) -> TokenStream {
    let storage = info.storage.as_ty();
    match int_strategy(info) {
        IntStrategy::Packed {
            offset, num_bits, ..
        } => {
            let nb = num_bits;
            let raw = quote! { #dec.next_enum(#nb) };
            if offset == 0 {
                quote! { #raw as #storage }
            } else {
                let off = int_lit(offset);
                quote! { (#raw as i64 + #off) as #storage }
            }
        }
        IntStrategy::Unsigned { min } => {
            if min == 0 {
                quote! { #dec.next_uint() as #storage }
            } else {
                let mn = int_lit(min);
                quote! { (#dec.next_uint() + (#mn as u64)) as #storage }
            }
        }
        IntStrategy::Signed => quote! { #dec.next_int() as #storage },
    }
}

fn render_decode_callback(ctx: &Ctx, t: &Type) -> TokenStream {
    match t {
        Type::String => quote! { |dec| dec.next_string() },
        Type::Int(info) => {
            let storage = info.storage.as_ty();
            match int_strategy(info) {
                IntStrategy::Packed {
                    offset, num_bits, ..
                } => {
                    let nb = num_bits;
                    if offset == 0 {
                        quote! { |dec| dec.next_enum(#nb) as #storage }
                    } else {
                        let off = int_lit(offset);
                        quote! { |dec| (dec.next_enum(#nb) as i64 + #off) as #storage }
                    }
                }
                IntStrategy::Unsigned { min } => {
                    if min == 0 {
                        quote! { |dec| dec.next_uint() as #storage }
                    } else {
                        let mn = int_lit(min);
                        quote! { |dec| (dec.next_uint() + (#mn as u64)) as #storage }
                    }
                }
                IntStrategy::Signed => quote! { |dec| dec.next_int() as #storage },
            }
        }
        Type::Float { precision } => match float_strategy(*precision) {
            FloatStrategy::Quantized { precision } => {
                let lit = float_lit(precision);
                quote! { |dec| dec.next_float_quantized(#lit) }
            }
            FloatStrategy::Full => quote! { |dec| dec.next_float() },
        },
        Type::Boolean => quote! { |dec| dec.next_boolean() },
        Type::Array(inner) => {
            let cb = render_decode_callback(ctx, inner);
            quote! { |dec| dec.next_array(#cb) }
        }
        Type::Optional(inner) => {
            let cb = render_decode_callback(ctx, inner);
            quote! { |dec| dec.next_optional(#cb) }
        }
        Type::Record { key, value } => {
            let kcb = render_decode_callback(ctx, key);
            let vcb = render_decode_callback(ctx, value);
            quote! { |dec| dec.next_record(#kcb, #vcb) }
        }
        Type::Reference(path) => {
            quote! { |dec| <#path as ::delta_pack::DeltaPack>::decode_from(dec) }
        }
        Type::SelfReference => {
            let s = ctx.self_tok();
            quote! { |dec| ::std::boxed::Box::new(<#s as ::delta_pack::DeltaPack>::decode_from(dec)) }
        }
    }
}

fn decode_diff_body(ctx: &Ctx, fields: &[Field]) -> TokenStream {
    let parts = fields.iter().map(|f| {
        let id = &f.ident;
        if has_own_change_bit(&f.ty) {
            let obj = quote! { obj.#id };
            let expr = render_decode_diff_direct(ctx, &f.ty, &obj);
            quote! { #id: #expr, }
        } else {
            let diff_cb = render_decode_diff_callback(ctx, &f.ty);
            quote! { #id: decoder.next_field_diff(&obj.#id, #diff_cb), }
        }
    });
    quote! { #(#parts)* }
}

fn render_decode_diff_direct(ctx: &Ctx, t: &Type, key: &TokenStream) -> TokenStream {
    let arg = if is_copy(t) {
        quote! { #key }
    } else {
        quote! { &#key }
    };
    render_decode_diff_body(ctx, t, &arg, &quote! { decoder }, DiffCtx::Value)
}

fn render_decode_diff_body(
    ctx: &Ctx,
    t: &Type,
    a: &TokenStream,
    dec: &TokenStream,
    diff_ctx: DiffCtx,
) -> TokenStream {
    match t {
        Type::String => quote! { #dec.next_string_diff(#a) },
        Type::Int(info) => {
            let storage = info.storage.as_ty();
            match int_strategy(info) {
                IntStrategy::Packed {
                    offset, num_bits, ..
                } => {
                    let nb = num_bits;
                    if offset == 0 {
                        quote! { #dec.next_enum_diff(#a as u32, #nb) as #storage }
                    } else {
                        let off = int_lit(offset);
                        quote! {
                            (#dec.next_enum_diff((#a as i64 - #off) as u32, #nb) as i64 + #off) as #storage
                        }
                    }
                }
                IntStrategy::Unsigned { min } => {
                    if min == 0 {
                        quote! { #dec.next_uint_diff(#a as u64) as #storage }
                    } else {
                        let mn = int_lit(min);
                        quote! { (#dec.next_uint_diff((#a as u64) - (#mn as u64)) + (#mn as u64)) as #storage }
                    }
                }
                IntStrategy::Signed => quote! { #dec.next_int_diff(#a as i64) as #storage },
            }
        }
        Type::Float { precision } => match float_strategy(*precision) {
            FloatStrategy::Quantized { precision } => {
                let lit = float_lit(precision);
                quote! { #dec.next_float_quantized_diff(#a, #lit) }
            }
            FloatStrategy::Full => quote! { #dec.next_float_diff(#a) },
        },
        Type::Boolean => match diff_ctx {
            DiffCtx::Element => quote! { !#a },
            DiffCtx::Value => quote! { #dec.next_boolean_diff(#a) },
        },
        Type::Array(inner) => {
            let dec_cb = render_decode_callback(ctx, inner);
            let diff_cb = render_decode_diff_callback(ctx, inner);
            quote! { #dec.next_array_diff(#a, #dec_cb, #diff_cb) }
        }
        Type::Optional(inner) => {
            let dec_cb = render_decode_callback(ctx, inner);
            let diff_cb = render_decode_diff_callback(ctx, inner);
            quote! { #dec.next_optional_diff(#a, #dec_cb, #diff_cb) }
        }
        Type::Record { key, value } => {
            let kcb = render_decode_callback(ctx, key);
            let vcb = render_decode_callback(ctx, value);
            let vdiff = render_decode_diff_callback(ctx, value);
            quote! { #dec.next_record_diff(#a, #kcb, #vcb, #vdiff) }
        }
        Type::Reference(path) => {
            quote! { <#path as ::delta_pack::DeltaPack>::decode_diff_from(#a, #dec) }
        }
        Type::SelfReference => {
            let s = ctx.self_tok();
            quote! {
                ::std::boxed::Box::new(<#s as ::delta_pack::DeltaPack>::decode_diff_from(#a, #dec))
            }
        }
    }
}

fn render_decode_diff_callback(ctx: &Ctx, t: &Type) -> TokenStream {
    let binder = if is_copy(t) {
        quote! { &a }
    } else {
        quote! { a }
    };
    let body = render_decode_diff_body(ctx, t, &quote! { a }, &quote! { dec }, DiffCtx::Element);
    quote! { |dec, #binder| #body }
}

fn int_lit(v: i64) -> TokenStream {
    let lit = proc_macro2::Literal::i64_unsuffixed(v);
    quote! { #lit }
}

fn float_lit(v: f32) -> TokenStream {
    let lit = proc_macro2::Literal::f32_suffixed(v);
    quote! { #lit }
}
