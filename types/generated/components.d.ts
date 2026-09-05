import type { Schema, Struct } from '@strapi/strapi';

export interface DietaPasto extends Struct.ComponentSchema {
  collectionName: 'components_dieta_pasti';
  info: {
    description: 'Un pasto del piano alimentare: orario, tipo, descrizione e valori nutrizionali.';
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
      'dieta.pasto': DietaPasto;
    }
  }
}
