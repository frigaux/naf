import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Observer } from 'rxjs';
import { environment } from '../../environments/environment';
import { NafRev2 } from './naf-rev2';
import { Entreprise } from './entreprise';
import { Commune } from './commune';
import { LatLngBounds, LatLngBoundsExpression, LatLngBoundsLiteral } from 'leaflet';
import { LimitesGPS } from './limites-gps';

@Service()
export class Referentiel {
  private http = inject(HttpClient);
  private static readonly effectifParCode: any = {
    NN: "pas de salarié au cours de l'année de référence et pas d'effectif au 31/12",
    '00': '0',
    '01': '1 ou 2 salariés',
    '02': '3 à 5 salariés',
    '03': '6 à 9 salariés',
    '11': '10 à 19 salariés',
    '12': '20 à 49 salariés',
    '21': '50 à 99 salariés',
    '22': '100 à 199 salariés',
    '31': '200 à 249 salariés',
    '32': '250 à 499 salariés',
    '41': '500 à 999 salariés',
    '42': '1 000 à 1 999 salariés',
    '51': '2 000 à 4 999 salariés',
    '52': '5 000 à 9 999 salariés',
    '53': '10 000 salariés et plus',
  };

  public nafRev2(): Observable<Array<NafRev2>> {
    return new Observable((observer: Observer<Array<NafRev2>>) => {
      this.http.get<any>(`${environment.urlReferentiel}/NAFREV2.json`).subscribe((json) => {
        observer.next(this.mapNafRev2(json, 1));
      });
    });
  }

  private mapNafRev2(json: any, niveau: number): Array<NafRev2> {
    if (typeof json === 'object') {
      const nafRev2: Array<NafRev2> = [];
      Object.keys(json).forEach((key: string) => {
        const nom = niveau < 4 ? key : json[key];
        nafRev2.push({
          code: niveau < 4 ? this.mapCode(key, json, niveau) : key,
          nom,
          matButton: '',
          enfants: this.mapNafRev2(json[key], niveau + 1),
          nomNormalise: this.normaliser(nom),
        });
      });
      return nafRev2.sort((nafRev2a, nafRev2b) => nafRev2a.nom.localeCompare(nafRev2b.nom));
    } else {
      return [];
    }
  }

  private mapCode(key: string, json: any, niveau: number): string {
    let j: any = json[key];
    let keys: string[] = Object.keys(j);
    let n: number = niveau + 1;
    while (n < 4) {
      j = j[keys[0]];
      keys = Object.keys(j);
      n++;
    }
    const naf = keys[0];
    if (niveau < 3) {
      return naf.substring(0, 2);
    } else {
      return naf.substring(0, 4);
    }
  }

  public entreprises(naf: string, limitesGPS: LimitesGPS): Observable<Array<Entreprise>> {
    return new Observable((observer: Observer<Array<Entreprise>>) => {
      this.http
        .get<Array<Entreprise>>(`${environment.urlReferentiel}/${naf.substring(0, 4)}.json`)
        .subscribe((entreprises) => {
          entreprises = entreprises
            .filter(
              (entreprise) =>
                entreprise.naf.startsWith(naf) &&
                limitesGPS.latitudeMinimum < entreprise.latitude &&
                limitesGPS.longitudeMinimum < entreprise.longitude &&
                limitesGPS.latitudeMaximum > entreprise.latitude &&
                limitesGPS.longitudeMaximum > entreprise.longitude,
            )
            .sort((e1, e2) => e1.etablissement.localeCompare(e2.etablissement));
          entreprises.forEach((entreprise) => {
            entreprise.effectif = Referentiel.effectifParCode[entreprise.codeEffectif];
          });
          observer.next(entreprises);
        });
    });
  }

  public normaliser(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  public communes(): Observable<Array<Commune>> {
    return new Observable((observer: Observer<Array<Commune>>) => {
      this.http
        .get<Array<Commune>>(`${environment.urlReferentiel}/communesFrance2026.json`)
        .subscribe((communes) => {
          communes.forEach((commune) => {
            commune.nomNormalise = this.normaliser(commune.nom);
          });
          observer.next(communes);
        });
    });
  }
}
