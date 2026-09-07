// Bardzo krótkie skróty przedmiotów — potrzebne do zmieszczenia całej szkoły
// (wszystkie klasy albo wszyscy nauczyciele) na sztywno dwóch stronach A3
// w formie jednej zbiorczej tabeli. Przedmioty spoza tej listy wracają
// w pełnym brzmieniu, żeby nic nowego w bazie nie zniknęło bez śladu.
const SUBJECT_ABBREVIATIONS = {
  'Biologia': 'biol',
  'Biologia rozszerzona': 'biol r',
  'Biznes i zarządzanie': 'BiZ',
  'Chemia': 'chem',
  'Chemia rozszerzona': 'chem r',
  'Doradztwo zawodowe': 'dor.zaw',
  'Edukacja dla bezpieczeństwa': 'EDB',
  'Edukacja obywatelska': 'EO',
  'Edukacja zdrowotna': 'EZ',
  'Fizyka': 'fiz',
  'Geografia': 'geogr',
  'Historia': 'hist',
  'Historia rozszerzona': 'hist r',
  'Informatyka': 'inf',
  'Język angielski': 'j.ang',
  'Język angielski rozszerzony': 'j.ang r',
  'Język hiszpański': 'j.hiszp',
  'Język niemiecki': 'j.niem',
  'Język polski': 'j.pol',
  'Język polski rozszerzony': 'j.pol r',
  'Lekcja wychowawcza': 'l.wych',
  'Matematyka': 'mat',
  'Matematyka rozszerzona': 'mat r',
  'Muzyka': 'muz',
  'Nauczyciel - bibliotekarz': 'bibl',
  'Pedagog specjalny': 'ped.spec',
  'Pedagog szkolny': 'ped',
  'Psycholog szkolny': 'psych',
  'Religia': 'rel',
  'Wiedza o społeczeństwie': 'wos',
  'Wychowanie fizyczne': 'wf',
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

// "SG1 - Sala Gimnastyczna" -> "SG1" — pełne nazwy sal gimnastycznych
// są za długie na wąską kolumnę zbiorczej tabeli.
export function abbreviateRoom(room) {
  if (!room) return room
  return room.split(' - ')[0]
}
