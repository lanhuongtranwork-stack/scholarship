import type { Continent } from './types'

export const CONTINENTS: Continent[] = [
  'Tất cả', 'Châu Á', 'Châu Âu', 'Bắc Mỹ', 'Nam Mỹ', 'Châu Phi', 'Châu Đại Dương',
]

export const CONTINENT_EN: Record<string, string> = {
  'Châu Á': 'Asia',
  'Châu Âu': 'Europe',
  'Bắc Mỹ': 'North America',
  'Nam Mỹ': 'South America',
  'Châu Phi': 'Africa',
  'Châu Đại Dương': 'Oceania',
}

export const COVERAGE_LABELS: Record<string, string> = {
  full: 'Học bổng toàn phần',
  full_tuition: '100% học phí',
}

export const CONFIDENCE_LABELS: Record<string, string> = {
  high: 'Độ tin cậy cao',
  medium: 'Độ tin cậy trung bình',
  low: 'Cần xác minh',
}

export const COMPETITION_LABELS: Record<string, string> = {
  low: 'Cạnh tranh thấp',
  medium: 'Cạnh tranh vừa',
  high: 'Cạnh tranh cao',
}

// ISO numeric → alpha-2 mapping for react-simple-maps TopoJSON
export const NUMERIC_TO_ALPHA2: Record<string, string> = {
  "004": "AF", "008": "AL", "012": "DZ", "024": "AO", "032": "AR",
  "036": "AU", "040": "AT", "031": "AZ", "044": "BS", "048": "BH",
  "050": "BD", "051": "AM", "052": "BB", "064": "BT", "068": "BO",
  "070": "BA", "072": "BW", "076": "BR", "096": "BN", "100": "BG",
  "116": "KH", "120": "CM", "124": "CA", "140": "CF", "144": "LK",
  "152": "CL", "156": "CN", "170": "CO", "174": "KM", "178": "CG",
  "180": "CD", "188": "CR", "191": "HR", "192": "CU", "196": "CY",
  "203": "CZ", "204": "BJ", "208": "DK", "214": "DO", "218": "EC",
  "818": "EG", "222": "SV", "226": "GQ", "232": "ER", "231": "ET",
  "246": "FI", "242": "FJ", "250": "FR", "266": "GA", "270": "GM",
  "288": "GH", "300": "GR", "320": "GT", "324": "GN", "624": "GW",
  "328": "GY", "332": "HT", "340": "HN", "348": "HU", "352": "IS",
  "356": "IN", "360": "ID", "364": "IR", "368": "IQ", "372": "IE",
  "376": "IL", "380": "IT", "388": "JM", "392": "JP", "400": "JO",
  "398": "KZ", "404": "KE", "408": "KP", "410": "KR", "414": "KW",
  "417": "KG", "418": "LA", "422": "LB", "426": "LS", "430": "LR",
  "434": "LY", "440": "LT", "442": "LU", "450": "MG", "454": "MW",
  "458": "MY", "466": "ML", "484": "MX", "496": "MN", "504": "MA",
  "508": "MZ", "516": "NA", "524": "NP", "528": "NL", "540": "NC",
  "554": "NZ", "558": "NI", "562": "NE", "566": "NG", "578": "NO",
  "586": "PK", "591": "PA", "598": "PG", "600": "PY", "604": "PE",
  "608": "PH", "616": "PL", "620": "PT", "630": "PR", "634": "QA",
  "642": "RO", "643": "RU", "646": "RW", "682": "SA", "686": "SN",
  "694": "SL", "706": "SO", "710": "ZA", "724": "ES",
  "736": "SD", "752": "SE", "756": "CH", "760": "SY", "762": "TJ",
  "764": "TH", "768": "TG", "788": "TN", "792": "TR", "795": "TM",
  "800": "UG", "804": "UA", "784": "AE", "826": "GB", "840": "US",
  "858": "UY", "860": "UZ", "862": "VE", "704": "VN", "887": "YE",
  "894": "ZM", "716": "ZW", "807": "MK",
  "499": "ME", "688": "RS", "703": "SK", "705": "SI", "112": "BY",
  "233": "EE", "428": "LV", "498": "MD",
}
