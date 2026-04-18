use proc_macro2::TokenStream;

#[derive(Clone)]
pub enum Type {
    String,
    Int(IntInfo),
    Float { precision: Option<f32> },
    Boolean,
    Array(Box<Type>),
    Optional(Box<Type>),
    Record { key: Box<Type>, value: Box<Type> },
    Reference(syn::Path),
    SelfReference,
}

#[derive(Clone, Debug)]
pub struct IntInfo {
    pub min: Option<i64>,
    pub max: Option<i64>,
    pub num_bits: Option<u8>,
    pub storage: IntStorage,
}

#[derive(Clone, Debug)]
pub enum IntStorage {
    I8,
    I16,
    I32,
    I64,
    U8,
    U16,
    U32,
    U64,
}

impl IntStorage {
    pub fn is_signed(&self) -> bool {
        matches!(self, Self::I8 | Self::I16 | Self::I32 | Self::I64)
    }

    pub fn as_ty(&self) -> TokenStream {
        match self {
            Self::I8 => quote::quote! { i8 },
            Self::I16 => quote::quote! { i16 },
            Self::I32 => quote::quote! { i32 },
            Self::I64 => quote::quote! { i64 },
            Self::U8 => quote::quote! { u8 },
            Self::U16 => quote::quote! { u16 },
            Self::U32 => quote::quote! { u32 },
            Self::U64 => quote::quote! { u64 },
        }
    }
}

pub fn compute_num_bits(min: i64, max: i64) -> Option<u8> {
    if max < min {
        return None;
    }
    let range = (max as i128) - (min as i128) + 1;
    let bits = if range <= 1 {
        1
    } else {
        (range as f64).log2().ceil() as u32
    };
    if bits <= 8 {
        Some(bits as u8)
    } else {
        None
    }
}

pub enum IntStrategy {
    Packed { offset: i64, max: i64, num_bits: u8 },
    Unsigned { min: i64 },
    Signed,
}

pub fn int_strategy(info: &IntInfo) -> IntStrategy {
    if let (Some(min), Some(max), Some(num_bits)) = (info.min, info.max, info.num_bits) {
        return IntStrategy::Packed {
            offset: min,
            max,
            num_bits,
        };
    }
    if let Some(min) = info.min {
        if min >= 0 {
            return IntStrategy::Unsigned { min };
        }
    }
    IntStrategy::Signed
}

pub enum FloatStrategy {
    Quantized { precision: f32 },
    Full,
}

pub fn float_strategy(precision: Option<f32>) -> FloatStrategy {
    match precision {
        Some(p) if p != 0.0 => FloatStrategy::Quantized { precision: p },
        _ => FloatStrategy::Full,
    }
}
