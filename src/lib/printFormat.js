// Skrócone nazwy przedmiotów na potrzeby gęstego wydruku A3.
// Przedmioty spoza tej listy wracają w pełnym brzmieniu (bez ryzyka
// pokazania pustego/dziwnego skrótu dla czegoś nowego w bazie).
const SUBJECT_ABBREVIATIONS = {
  'Biznes i zarządzanie': 'Biznes i zarz.',
  'Doradztwo zawodowe': 'Dor. zawodowe',
  'Edukacja dla bezpieczeństwa': 'EdB',
  'Edukacja obywatelska': 'Ed. obywatelska',
  'Edukacja zdrowotna': 'Ed. zdrowotna',
  'Język angielski': 'J. angielski',
  'Język hiszpański': 'J. hiszpański',
  'Język niemiecki': 'J. niemiecki',
  'Język polski': 'J. polski',
  'Wiedza o społeczeństwie': 'WOS',
  'Wychowanie fizyczne': 'WF',
  'Nauczyciel - bibliotekarz': 'Bibliotekarz',
  'Pedagog specjalny': 'Pedagog spec.',
  'Pedagog szkolny': 'Pedagog szk.',
  'Psycholog szkolny': 'Psycholog',
  'Lekcja wychowawcza': 'Wychowawcza',
  'Język polski rozszerzony': 'J. polski rozsz.',
  'Matematyka rozszerzona': 'Matematyka rozsz.',
  'Biologia rozszerzona': 'Biologia rozsz.',
  'Historia rozszerzona': 'Historia rozsz.',
  'Chemia rozszerzona': 'Chemia rozsz.',
  'Język angielski rozszerzony': 'J. angielski rozsz.',
}

export function abbreviateSubject(subject) {
  if (!subject) return subject
  return SUBJECT_ABBREVIATIONS[subject] ?? subject
}

// "Beraś Piotr" -> "P. Beraś", "Ułaszyn-Palkowska Grażyna" -> "G. Ułaszyn-Palkowska"
// Zakłada konwencję z bazy: nazwisko(a) na początku, imię na końcu.
export function formatTeacherShort(fullName) {
  if (!fullName) return fullName
  const parts = fullName.trim().split(' ')
  if (parts.length < 2) return fullName
  const firstName = parts[parts.length - 1]
  const surname = parts.slice(0, -1).join(' ')
  return `${firstName.charAt(0)}. ${surname}`
}
