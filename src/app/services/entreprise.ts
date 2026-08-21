export interface Entreprise {
  etablissement: string;
  naf: string;
  siret: string;
  codeEffectif: string;
  dateCreation: string; // date norme ISO 8601
  etablissementSiege: boolean;
  typeVoie: string;
  voie: string;
  codePostal: string;
  commune: string;
  coordonneeLambertAbscisse: number;
  coordonneeLambertOrdonnee: number;
  effectif?: string;
  longitude?: number;
  latitude?: number;
}
