mod attrs;
mod codegen;
mod ir;
mod type_map;

use proc_macro::TokenStream;
use syn::{Data, DeriveInput, Fields};

#[proc_macro_derive(DeltaPack, attributes(delta_pack))]
pub fn derive_delta_pack(input: TokenStream) -> TokenStream {
    let input = syn::parse_macro_input!(input as DeriveInput);
    match expand(input) {
        Ok(ts) => ts.into(),
        Err(e) => e.to_compile_error().into(),
    }
}

fn expand(input: DeriveInput) -> syn::Result<proc_macro2::TokenStream> {
    match &input.data {
        Data::Struct(s) => expand_struct(&input, s),
        Data::Enum(e) => expand_enum(&input, e),
        Data::Union(_) => Err(syn::Error::new_spanned(
            &input.ident,
            "raw `union` types are not supported",
        )),
    }
}

fn expand_struct(
    input: &DeriveInput,
    data: &syn::DataStruct,
) -> syn::Result<proc_macro2::TokenStream> {
    let name = &input.ident;
    let fields = match &data.fields {
        Fields::Named(named) => &named.named,
        Fields::Unit => {
            return Err(syn::Error::new_spanned(
                name,
                "unit structs are not supported",
            ));
        }
        Fields::Unnamed(_) => {
            return Err(syn::Error::new_spanned(
                name,
                "tuple structs are not supported; use a struct with named fields",
            ));
        }
    };

    let ctx = type_map::TypeCtx { self_name: name };
    let mut out_fields = Vec::new();
    for field in fields {
        let ident = field.ident.clone().expect("named field");
        let field_attrs = attrs::parse_field_attrs(&field.attrs)?;
        let ty = type_map::map_field(&field.ty, &field_attrs, &ctx)?;
        out_fields.push(codegen::Field { ident, ty });
    }

    Ok(codegen::emit_struct(name, &out_fields))
}

fn expand_enum(input: &DeriveInput, data: &syn::DataEnum) -> syn::Result<proc_macro2::TokenStream> {
    let name = &input.ident;

    if data.variants.is_empty() {
        return Err(syn::Error::new_spanned(
            name,
            "empty enums are not supported",
        ));
    }

    let all_unit = data
        .variants
        .iter()
        .all(|v| matches!(v.fields, Fields::Unit));
    let all_tuple = data.variants.iter().all(|v| match &v.fields {
        Fields::Unnamed(unnamed) => unnamed.unnamed.len() == 1,
        _ => false,
    });

    if all_unit {
        let variants: Vec<syn::Ident> = data.variants.iter().map(|v| v.ident.clone()).collect();
        Ok(codegen::emit_c_enum(name, &variants))
    } else if all_tuple {
        let mut variants = Vec::with_capacity(data.variants.len());
        for v in &data.variants {
            let unnamed = match &v.fields {
                Fields::Unnamed(u) => u,
                _ => unreachable!(),
            };
            let inner = &unnamed.unnamed[0].ty;
            let path = match inner {
                syn::Type::Path(p) if p.qself.is_none() => p.path.clone(),
                _ => {
                    return Err(syn::Error::new_spanned(
                        inner,
                        "union variant must wrap a single named type (e.g. Variant(SomeStruct))",
                    ));
                }
            };
            variants.push(codegen::Variant {
                ident: v.ident.clone(),
                inner_path: path,
            });
        }
        Ok(codegen::emit_union(name, &variants))
    } else {
        Err(syn::Error::new_spanned(
            name,
            "all variants must be either unit (C-style enum) or single-tuple `Variant(Inner)` (union). Mixed or struct-variants are not supported.",
        ))
    }
}
