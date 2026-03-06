// Korean → Albanian translations for Encar inspection data

// Diagnostic panel names (UPPER_SNAKE_CASE from API)
export const PANEL_NAMES: Record<string, string> = {
  FRONT_DOOR_LEFT:    'Dera e Përparme Majtas',
  FRONT_DOOR_RIGHT:   'Dera e Përparme Djathtas',
  BACK_DOOR_LEFT:     'Dera e Pasme Majtas',
  BACK_DOOR_RIGHT:    'Dera e Pasme Djathtas',
  HOOD:               'Kapaku',
  TRUNK_LID:          'Bagazhi',
  FRONT_FENDER_LEFT:  'Krahësorja e Përparme Majtas',
  FRONT_FENDER_RIGHT: 'Krahësorja e Përparme Djathtas',
  REAR_FENDER_LEFT:   'Krahësorja e Pasme Majtas',
  REAR_FENDER_RIGHT:  'Krahësorja e Pasme Djathtas',
  FRONT_BUMPER:       'Parakolpi i Përparmë',
  REAR_BUMPER:        'Parakolpi i Pasmë',
  ROOF_PANEL:         'Paneli i Çatisë',
  ROCKER_PANEL_LEFT:  'Paneli Anësor Majtas',
  ROCKER_PANEL_RIGHT: 'Paneli Anësor Djathtas',
  QUARTER_PANEL_LEFT: 'Paneli i Çereku Majtas',
  QUARTER_PANEL_RIGHT:'Paneli i Çereku Djathtas',
  CHECKER_COMMENT:    'Komenti i Inspektorit',
  OUTER_PANEL_COMMENT:'Komenti i Paneleve të Jashtme',
};

// Diagnostic result codes
export const RESULT_CODES: Record<string, { label: string; status: 'ok' | 'warning' | 'fail' | 'info' }> = {
  NORMAL:      { label: 'Normale',           status: 'ok' },
  ABNORMAL:    { label: 'Jonormale',         status: 'fail' },
  EXCHANGED:   { label: 'E Ndërruar',        status: 'warning' },
  SHEET_METAL: { label: 'Riparim Llamarine', status: 'warning' },
  CORROSION:   { label: 'Korrozion',         status: 'fail' },
  DAMAGE:      { label: 'E Dëmtuar',         status: 'fail' },
  SCRATCH:     { label: 'E Gërvishtur',      status: 'warning' },
  UNEVEN:      { label: 'E Pabarabartë',     status: 'warning' },
};

// Korean inspection group titles → Albanian
export const GROUP_TITLES: Record<string, string> = {
  '자기진단':   'Vetë-Diagnostikimi',
  '원동기':     'Motori',
  '변속기':     'Transmisioni',
  '동력전달':   'Sistemi i Lëvizjes',
  '조향':       'Drejtimi',
  '제동':       'Frenimi',
  '전기':       'Sistemi Elektrik',
  '연료':       'Sistemi i Karburantit',
  '타이어':     'Gomat',
  '기타':       'Të Tjera',
};

// Korean inspection item titles → Albanian
export const ITEM_TITLES: Record<string, string> = {
  // Vetë-Diagnostikimi
  '원동기':                     'Motori',
  '변속기':                     'Transmisioni',
  // Motori
  '작동상태(공회전)':           'Funksionimi në Bosh',
  '오일누유':                   'Rrjedhje Vaji',
  '오일 유량':                  'Niveli i Vajit',
  '냉각수누수':                 'Rrjedhje Ftohësi',
  '커먼레일':                   'Common Rail',
  '고압펌프(커먼레일)':          'Pompë me Presion të Lartë',
  // Transmisioni
  '자동변속기(A/T)':            'Transmision Automatik',
  '수동변속기(M/T)':            'Transmision Manual',
  'A/T오일누유':                'Rrjedhje Vaji AT',
  'A/T 오일 유량 및 상태':      'Niveli & Gjendja e Vajit AT',
  '작동상태(진행시)':           'Funksionimi (në Lëvizje)',
  // Sistemi i Lëvizjes
  '클러치 어셈블리':            'Fërkim (Ambreiazh)',
  '등속조인트':                 'Bashkuesi CV',
  '추진축 및 베어링':           'Boshti i Lëvizjes & Kushineta',
  '추친축 및 베어링':           'Boshti i Lëvizjes & Kushineta',
  '디피렌셜 기어':              'Ingranazhi Diferencial',
  // Drejtimi
  '동력조향 작동 오일 누유':    'Rrjedhje Vaji Servodrejtimi',
  '작동상태':                   'Gjendja e Funksionimit',
  '스티어링기어(랙&피니언)':    'Ingranazhi i Drejtimit (Rack & Pinion)',
  '타이로드엔드 및 볼조인트':   'Tirantë & Bashkues Sfere',
  // Frenimi
  '브레이크 마스터 실린더오일 누유': 'Rrjedhje Vaji Cilindri Kryesor i Frenave',
  '브레이크 오일 누유':         'Rrjedhje Vaji Frenash',
  '배력장치 상태':              'Përforcuesi i Frenave',
  // Sistemi Elektrik
  '발전기 출력':                'Dalja e Alternatorit',
  '시동 모터':                  'Motori i Nisjes',
  '와이퍼 모터 기능':           'Motori i Fshirëseve',
  '실내송풍 모터':              'Motori i Ventilimit',
  '라디에이터 팬 모터':         'Motori i Ventilatorit të Radiatorit',
  '윈도우 모터':                'Motori i Dritareve',
  // Karburanti
  '연료누출(LP가스포함)':       'Rrjedhje Karburanti (përfshirë LPG)',
};

// Korean status values → Albanian
export const STATUS_VALUES: Record<string, { label: string; status: 'ok' | 'warning' | 'fail' | 'none' }> = {
  '양호':   { label: 'Mirë',          status: 'ok' },
  '적정':   { label: 'E Përshtatshme', status: 'ok' },
  '없음':   { label: 'Asnjë',         status: 'ok' },
  '정상':   { label: 'Normale',       status: 'ok' },
  '주의':   { label: 'Kujdes',        status: 'warning' },
  '불량':   { label: 'Defekt',        status: 'fail' },
  '있음':   { label: 'E Pranishme',   status: 'fail' },
  '과다':   { label: 'Tepër',         status: 'warning' },
  '부족':   { label: 'E Pamjaftueshme', status: 'warning' },
};

export function translateGroupTitle(korean: string): string {
  return GROUP_TITLES[korean] ?? korean;
}

export function translateItemTitle(korean: string): string {
  return ITEM_TITLES[korean] ?? korean;
}

export function translateStatus(korean: string): { label: string; status: string } {
  return STATUS_VALUES[korean] ?? { label: korean, status: 'ok' };
}

export function translatePanelName(name: string): string {
  return PANEL_NAMES[name] ?? name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}
