import type { Schema, Struct } from '@strapi/strapi';

export interface CalendarioPartita extends Struct.ComponentSchema {
  collectionName: 'components_calendario_partite';
  info: {
    description: "Una partita del calendario dell'atleta: avversari, data/ora, stadio, competizione e risultato.";
    displayName: 'Partita';
  };
  attributes: {
    competizione: Schema.Attribute.Enumeration<
      ['serie_a', 'champions', 'coppa_italia', 'amichevole']
    >;
    dataOra: Schema.Attribute.DateTime & Schema.Attribute.Required;
    golCasa: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    golTrasferta: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    squadraCasa: Schema.Attribute.String;
    squadraTrasferta: Schema.Attribute.String;
    stadio: Schema.Attribute.String;
  };
}

export interface CoachVideo extends Struct.ComponentSchema {
  collectionName: 'components_coach_video';
  info: {
    description: "Un video coach dell'atleta: titolo, giorno, categoria, durata e link al video su Bunny Stream.";
    displayName: 'Video';
  };
  attributes: {
    categoria: Schema.Attribute.Enumeration<
      ['pre_partita', 'focus', 'sonno', 'stress', 'recupero']
    >;
    data: Schema.Attribute.Date & Schema.Attribute.Required;
    durataMinuti: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    titolo: Schema.Attribute.String & Schema.Attribute.Required;
    video: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface DietaGiorniSettimana extends Struct.ComponentSchema {
  collectionName: 'components_dieta_giorni_settimana';
  info: {
    description: 'Giorni della settimana in cui si ripete un pasto della settimana tipo.';
    displayName: 'Giorni settimana';
  };
  attributes: {
    dom: Schema.Attribute.Boolean & Schema.Attribute.Required & Schema.Attribute.DefaultTo<true>;
    gio: Schema.Attribute.Boolean & Schema.Attribute.Required & Schema.Attribute.DefaultTo<true>;
    lun: Schema.Attribute.Boolean & Schema.Attribute.Required & Schema.Attribute.DefaultTo<true>;
    mar: Schema.Attribute.Boolean & Schema.Attribute.Required & Schema.Attribute.DefaultTo<true>;
    mer: Schema.Attribute.Boolean & Schema.Attribute.Required & Schema.Attribute.DefaultTo<true>;
    sab: Schema.Attribute.Boolean & Schema.Attribute.Required & Schema.Attribute.DefaultTo<true>;
    ven: Schema.Attribute.Boolean & Schema.Attribute.Required & Schema.Attribute.DefaultTo<true>;
  };
}

export interface DietaPasto extends Struct.ComponentSchema {
  collectionName: 'components_dieta_pasti';
  info: {
    description: 'Un pasto della settimana tipo: orario, tipo, descrizione, valori nutrizionali e giorni in cui si ripete.';
    displayName: 'Pasto';
  };
  attributes: {
    carboidratiG: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    descrizione: Schema.Attribute.Text & Schema.Attribute.Required;
    giorni: Schema.Attribute.Component<'dieta.giorni-settimana', false>;
    grassiG: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    kcal: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    orario: Schema.Attribute.Time & Schema.Attribute.Required;
    proteineG: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    tipo: Schema.Attribute.Enumeration<
      ['colazione', 'spuntino', 'pranzo', 'pre_allenamento', 'cena']
    > &
      Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'calendario.partita': CalendarioPartita;
      'coach.video': CoachVideo;
      'dieta.giorni-settimana': DietaGiorniSettimana;
      'dieta.pasto': DietaPasto;
    }
  }
}
