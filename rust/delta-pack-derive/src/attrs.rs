use syn::spanned::Spanned;

#[derive(Default, Debug)]
pub struct FieldAttrs {
    pub min: Option<i64>,
    pub max: Option<i64>,
    pub precision: Option<f32>,
}

pub fn parse_field_attrs(attrs: &[syn::Attribute]) -> syn::Result<FieldAttrs> {
    let mut out = FieldAttrs::default();
    for attr in attrs {
        if !attr.path().is_ident("delta_pack") {
            continue;
        }
        attr.parse_nested_meta(|meta| {
            if meta.path.is_ident("range") {
                meta.parse_nested_meta(|range_meta| {
                    if range_meta.path.is_ident("min") {
                        let lit: syn::LitInt = range_meta.value()?.parse()?;
                        out.min = Some(lit.base10_parse()?);
                    } else if range_meta.path.is_ident("max") {
                        let lit: syn::LitInt = range_meta.value()?.parse()?;
                        out.max = Some(lit.base10_parse()?);
                    } else {
                        return Err(range_meta.error("expected `min` or `max`"));
                    }
                    Ok(())
                })?;
            } else if meta.path.is_ident("precision") {
                let value = meta.value()?;
                let lit: syn::LitFloat = value.parse()?;
                out.precision = Some(lit.base10_parse()?);
            } else {
                return Err(meta.error("unknown delta_pack attribute"));
            }
            Ok(())
        })?;
    }
    if let (Some(min), Some(max)) = (out.min, out.max) {
        if min > max {
            return Err(syn::Error::new(
                attrs
                    .first()
                    .map(|a| a.span())
                    .unwrap_or_else(proc_macro2::Span::call_site),
                format!("range min ({}) > max ({})", min, max),
            ));
        }
    }
    Ok(out)
}
