use syn::{spanned::Spanned, GenericArgument, PathArguments, Type as SynType};

use crate::attrs::FieldAttrs;
use crate::ir::{compute_num_bits, IntInfo, IntStorage, Type};

pub struct TypeCtx<'a> {
    pub self_name: &'a syn::Ident,
}

pub fn map_field(ty: &SynType, attrs: &FieldAttrs, ctx: &TypeCtx) -> syn::Result<Type> {
    map_type(ty, Some(attrs), ctx)
}

fn map_type(ty: &SynType, attrs: Option<&FieldAttrs>, ctx: &TypeCtx) -> syn::Result<Type> {
    let path = match ty {
        SynType::Path(p) if p.qself.is_none() => &p.path,
        _ => return Err(syn::Error::new(ty.span(), "unsupported type")),
    };

    let last = path
        .segments
        .last()
        .ok_or_else(|| syn::Error::new(ty.span(), "empty path"))?;
    let name = last.ident.to_string();

    match name.as_str() {
        "String" => Ok(Type::String),
        "bool" => Ok(Type::Boolean),
        "f32" => {
            let precision = attrs.and_then(|a| a.precision);
            Ok(Type::Float { precision })
        }
        "f64" => Err(syn::Error::new(
            ty.span(),
            "f64 is not supported; use f32 (delta-pack only encodes 4-byte floats)",
        )),
        "i8" | "i16" | "i32" | "i64" | "u8" | "u16" | "u32" | "u64" => {
            let storage = match name.as_str() {
                "i8" => IntStorage::I8,
                "i16" => IntStorage::I16,
                "i32" => IntStorage::I32,
                "i64" => IntStorage::I64,
                "u8" => IntStorage::U8,
                "u16" => IntStorage::U16,
                "u32" => IntStorage::U32,
                "u64" => IntStorage::U64,
                _ => unreachable!(),
            };
            let signed = storage.is_signed();
            let mut min = attrs.and_then(|a| a.min);
            let max = attrs.and_then(|a| a.max);
            if !signed && min.is_none() {
                min = Some(0);
            }
            let num_bits = match (min, max) {
                (Some(a), Some(b)) => compute_num_bits(a, b),
                _ => None,
            };
            Ok(Type::Int(IntInfo {
                min,
                max,
                num_bits,
                storage,
            }))
        }
        "usize" | "isize" | "i128" | "u128" => Err(syn::Error::new(
            ty.span(),
            format!(
                "{} is not supported; use a fixed-width integer (i8..i64, u8..u64)",
                name
            ),
        )),
        "Vec" => {
            let inner = single_generic(last, ty.span())?;
            Ok(Type::Array(Box::new(map_type(inner, None, ctx)?)))
        }
        "Option" => {
            let inner = single_generic(last, ty.span())?;
            Ok(Type::Optional(Box::new(map_type(inner, None, ctx)?)))
        }
        "IndexMap" => {
            let (key, value) = two_generics(last, ty.span())?;
            let key_ir = map_type(key, None, ctx)?;
            let value_ir = map_type(value, None, ctx)?;
            match &key_ir {
                Type::String | Type::Int(_) => {}
                _ => {
                    return Err(syn::Error::new(
                        key.span(),
                        "IndexMap key must be a string or integer type",
                    ))
                }
            }
            Ok(Type::Record {
                key: Box::new(key_ir),
                value: Box::new(value_ir),
            })
        }
        "HashMap" | "BTreeMap" => Err(syn::Error::new(
            ty.span(),
            format!(
                "{} is not supported; use IndexMap (delta-pack requires insertion-order preservation)",
                name
            ),
        )),
        "Box" => {
            let inner = single_generic(last, ty.span())?;
            let inner_path = match inner {
                SynType::Path(p) if p.qself.is_none() => &p.path,
                _ => {
                    return Err(syn::Error::new(
                        inner.span(),
                        "Box<T> where T is not a named type is not supported",
                    ));
                }
            };
            let inner_name = &inner_path
                .segments
                .last()
                .ok_or_else(|| syn::Error::new(inner.span(), "empty path"))?
                .ident;
            if inner_name == "Self" || inner_name == ctx.self_name {
                Ok(Type::SelfReference)
            } else {
                Err(syn::Error::new(
                    ty.span(),
                    "Box<T> is only supported for self-references (Box<Self>); wrap other types without Box",
                ))
            }
        }
        _ if name == "Self" || &last.ident == ctx.self_name => Ok(Type::SelfReference),
        _ => Ok(Type::Reference(path.clone())),
    }
}

fn single_generic(seg: &syn::PathSegment, span: proc_macro2::Span) -> syn::Result<&SynType> {
    match &seg.arguments {
        PathArguments::AngleBracketed(args) => {
            if args.args.len() != 1 {
                return Err(syn::Error::new(span, "expected one type parameter"));
            }
            match &args.args[0] {
                GenericArgument::Type(t) => Ok(t),
                _ => Err(syn::Error::new(span, "expected type parameter")),
            }
        }
        _ => Err(syn::Error::new(span, "expected generic arguments")),
    }
}

fn two_generics(
    seg: &syn::PathSegment,
    span: proc_macro2::Span,
) -> syn::Result<(&SynType, &SynType)> {
    match &seg.arguments {
        PathArguments::AngleBracketed(args) => {
            if args.args.len() != 2 {
                return Err(syn::Error::new(span, "expected two type parameters"));
            }
            let a = match &args.args[0] {
                GenericArgument::Type(t) => t,
                _ => return Err(syn::Error::new(span, "expected type parameter")),
            };
            let b = match &args.args[1] {
                GenericArgument::Type(t) => t,
                _ => return Err(syn::Error::new(span, "expected type parameter")),
            };
            Ok((a, b))
        }
        _ => Err(syn::Error::new(span, "expected generic arguments")),
    }
}
