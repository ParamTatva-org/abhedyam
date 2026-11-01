#![forbid(unsafe_code)]

use std::collections::HashMap;
use std::fmt;
use std::sync::OnceLock;

pub const CONSONANTS: [&str; 33] = [
    "k", "kh", "g", "gh", "ṅ",
    "c", "ch", "j", "jh", "ñ",
    "ṭ", "ṭh", "ḍ", "ḍh", "ṇ",
    "t", "th", "d", "dh", "n",
    "p", "ph", "b", "bh", "m",
    "y", "r", "l", "v",
    "ś", "ṣ", "s", "h",
];

pub const MATRAS: [&str; 16] = [
    "a", "ā", "i", "ī", "u", "ū", "ṛ", "ṝ",
    "ḷ", "ḹ", "e", "ai", "o", "au", "aṃ", "aḥ",
];

const LAGHU_MATRAS: [usize; 5] = [0, 2, 4, 6, 8];

pub const CONSONANT_COUNT: usize = 33;
pub const MATRA_COUNT: usize = 16;
pub const Q: usize = CONSONANT_COUNT * MATRA_COUNT;

pub const DANDA: &str = "।";
pub const DANDA_DOUBLE: &str = "॥";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MatraWeight {
    Laghu,
    Guru,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Error {
    OutOfRange { value: u16, max: u16 },
    UnknownSyllable { token: String },
    InvalidMatraIndex { index: usize },
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::OutOfRange { value, max } => {
                write!(f, "valor {value} fora de Z_Q (válido: 0..{max})")
            }
            Error::UnknownSyllable { token } => {
                write!(f, "sílaba desconhecida: {token:?}")
            }
            Error::InvalidMatraIndex { index } => {
                write!(f, "matra {index} inválida (válido: 0..{})", MATRA_COUNT - 1)
            }
        }
    }
}

impl std::error::Error for Error {}

pub type Result<T> = std::result::Result<T, Error>;

fn encode_table() -> &'static [String; 528] {
    static TABLE: OnceLock<[String; 528]> = OnceLock::new();
    TABLE.get_or_init(|| {
        let mut table: Vec<String> = Vec::with_capacity(Q);
        let mut seen = HashMap::new();
        for c in CONSONANTS {
            for m in MATRAS {
                let syllable = format!("{c}{m}");
                if seen.insert(syllable.clone(), true).is_some() {
                    panic!("colisão de sílabas: {syllable}");
                }
                table.push(syllable);
            }
        }
        let arr: [String; 528] = table.try_into().expect("528 sílabas");
        arr
    })
}

fn decode_map() -> &'static HashMap<&'static str, u16> {
    static MAP: OnceLock<HashMap<&'static str, u16>> = OnceLock::new();
    MAP.get_or_init(|| {
        encode_table()
            .iter()
            .enumerate()
            .map(|(v, s)| (s.as_str(), v as u16))
            .collect()
    })
}

pub fn encode_value(value: u16) -> Result<String> {
    if value as usize >= Q {
        return Err(Error::OutOfRange {
            value,
            max: (Q - 1) as u16,
        });
    }
    Ok(encode_table()[value as usize].clone())
}

pub fn decode_token(token: &str) -> Result<u16> {
    decode_map()
        .get(token)
        .copied()
        .ok_or(Error::UnknownSyllable {
            token: token.to_string(),
        })
}

pub fn decode_verse(verse: &str) -> Result<Vec<u16>> {
    verse
        .split_whitespace()
        .map(|t| t.replace([DANDA, DANDA_DOUBLE], ""))
        .filter(|t| !t.is_empty())
        .map(|t| decode_token(&t))
        .collect()
}

pub fn encode_vector(values: &[u16], use_meter: bool) -> Result<String> {
    let mut out: Vec<String> = Vec::with_capacity(values.len() * 2);
    for (i, &v) in values.iter().enumerate() {
        out.push(encode_value(v)?);
        if use_meter && (i + 1) % 8 == 0 {
            out.push(DANDA.to_string());
        }
    }
    Ok(out.join(" "))
}

pub fn get_matra_weight(matra_index: usize) -> Result<MatraWeight> {
    if matra_index >= MATRA_COUNT {
        return Err(Error::InvalidMatraIndex { index: matra_index });
    }
    if LAGHU_MATRAS.contains(&matra_index) {
        Ok(MatraWeight::Laghu)
    } else {
        Ok(MatraWeight::Guru)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Syllable {
    pub value: u16,
}

impl Syllable {
    pub fn new(value: u16) -> Result<Self> {
        if value as usize >= Q {
            return Err(Error::OutOfRange {
                value,
                max: (Q - 1) as u16,
            });
        }
        Ok(Syllable { value })
    }

    pub fn to_sanskrit(&self) -> String {
        encode_value(self.value).expect("Syllable::new valida a faixa")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashSet;

    #[test]
    fn table_is_injective() {
        let set: HashSet<&str> = encode_table().iter().map(|s| s.as_str()).collect();
        assert_eq!(set.len(), Q, "528 valores precisam de 528 sílabas distintas");
        assert_eq!(encode_table().len(), Q);
    }

    #[test]
    fn roundtrip_full_domain() {
        for v in 0..Q as u16 {
            let syllable = encode_value(v).expect("dentro da faixa");
            assert_eq!(decode_token(&syllable).expect("sílaba válida"), v);
        }
    }

    #[test]
    fn syllable_struct_roundtrip() {
        for v in 0..Q as u16 {
            let s = Syllable::new(v).expect("dentro da faixa");
            assert_eq!(decode_token(&s.to_sanskrit()).expect("sílaba válida"), v);
        }
    }

    #[test]
    fn rejects_out_of_range() {
        for bad in [Q as u16, (Q - 1) as u16 + 1, 65535] {
            assert!(encode_value(bad).is_err(), "{bad} precisa ser rejeitado");
            assert!(Syllable::new(bad).is_err());
        }
    }

    #[test]
    fn unknown_syllable_is_error_not_zero() {
        let err = decode_token("zzṛ").expect_err("sílaba desconhecida");
        assert_eq!(
            err,
            Error::UnknownSyllable {
                token: "zzṛ".to_string()
            }
        );
        assert!(decode_verse("kha zzṛ").is_err());
    }

    #[test]
    fn dandas_are_ignored_in_decode() {
        let values: Vec<u16> = (0..24).collect();
        let verse = encode_vector(&values, true).expect("dentro da faixa");
        assert_eq!(verse.matches(DANDA).count(), 3);
        let back = decode_verse(&verse).expect("verso válido");
        assert_eq!(back, values);
    }

    #[test]
    fn vector_roundtrip_without_meter() {
        let values: Vec<u16> = [0, 1, 15, 16, 100, 250, 527].to_vec();
        let verse = encode_vector(&values, false).expect("dentro da faixa");
        assert_eq!(decode_verse(&verse).expect("verso válido"), values);
    }

    #[test]
    fn matra_weights_match_fonetica() {
        assert_eq!(get_matra_weight(0).expect("matra válida"), MatraWeight::Laghu);
        for laghu in LAGHU_MATRAS {
            assert_eq!(
                get_matra_weight(laghu).expect("matra válida"),
                MatraWeight::Laghu
            );
        }
        for guru in [1usize, 3, 5, 7, 9, 10, 11, 12, 13, 14, 15] {
            assert_eq!(
                get_matra_weight(guru).expect("matra válida"),
                MatraWeight::Guru
            );
        }
        assert!(get_matra_weight(MATRA_COUNT).is_err());
    }

    #[test]
    fn known_first_and_last_syllables() {
        assert_eq!(encode_value(0).expect("dentro da faixa"), "ka");
        assert_eq!(encode_value(1).expect("dentro da faixa"), "kā");
        assert_eq!(encode_value(15).expect("dentro da faixa"), "kaḥ");
        assert_eq!(encode_value(16).expect("dentro da faixa"), "kha");
        assert_eq!(encode_value(527).expect("dentro da faixa"), "haḥ");
    }
}
