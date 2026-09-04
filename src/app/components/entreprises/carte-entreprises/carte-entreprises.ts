import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  output,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { NafRev2 } from '../../../services/naf-rev2.interface';
import * as L from 'leaflet';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Referentiel } from '../../../services/referentiel';
import { Entreprise } from '../../../services/entreprise.interface';
import { Commune } from '../../../services/commune.interface';
import { LimitesGPS } from '../../../services/limites-gps.interface';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-carte-entreprises',
  imports: [MatProgressBar],
  templateUrl: './carte-entreprises.html',
  styleUrl: './carte-entreprises.sass',
})
export class CarteEntreprises implements AfterViewInit {
  outputEntrepriseSelectionnee = output<Entreprise>({ alias: 'entrepriseSelectionnee' });

  private referentiel = inject(Referentiel);
  private translate = inject(TranslateService);

  private limitesGPS?: LimitesGPS;

  @ViewChild('conteneurCarte') conteneurCarte!: ElementRef;
  private carte!: L.Map;
  private groupeMarqueurs = L.layerGroup();
  private static readonly iconeMarqueur = L.divIcon({
    className: 'fond-marqueur', // Classe CSS personnalisée
    html: '<div class="marqueur"></div>',
    iconSize: [20, 20], // Taille de l'élément
    iconAnchor: [10, 10], // Point d'ancrage central
  });

  // données pour la vue
  protected chargement: WritableSignal<boolean> = signal(false);

  ngAfterViewInit(): void {
    this.initialiserCarte();
  }

  private initialiserCarte(): void {
    // 1. Définir les frontières géographiques de la France métropolitaine (Sud-Ouest et Nord-Est)
    const france = L.latLngBounds(
      L.latLng(41.3, -5.5), // Coin Sud-Ouest (proche de la frontière espagnole / océan)
      L.latLng(51.1, 10.0), // Coin Nord-Est (proche des frontières allemandes / belges)
    );

    // 2. Initialiser la carte avec les restrictions
    this.carte = L.map(this.conteneurCarte.nativeElement, {
      center: [46.2276, 2.2137], // Centré sur la France
      zoom: 6, // Zoom initial idéal pour la France
      minZoom: 6, // Empêche de dézoomer pour voir le monde entier
      maxZoom: 18, // Limite de zoom maximal pour voir les rues
      maxBounds: france, // Bloque le déplacement hors de cette zone
      maxBoundsViscosity: 1.0, // Effet "mur de briques" : rebondit immédiatement si on glisse hors de la zone
    });

    // 3. Charger le fond de carte OpenStreetMap (avec option pour éviter les duplications)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      noWrap: true, // Empêche la carte de se répéter indéfiniment à l'horizontale
      bounds: france, // Optimise le chargement en ne demandant que les tuiles de cette zone
    }).addTo(this.carte);

    this.groupeMarqueurs.addTo(this.carte);
  }

  public positionner(commune: Commune, rayon: number): void {
    this.carte.setZoom(rayon < 11 ? 12 : rayon < 26 ? 11 : 10);
    this.carte.setView([commune.latitude, commune.longitude]);

    const deltaLatitude = this.calculerDeltaLatitude(rayon);
    const deltaLongitude = this.calculerDeltaLongitude(rayon, commune);

    this.limitesGPS = {
      latitudeMinimum: commune.latitude - deltaLatitude,
      longitudeMinimum: commune.longitude - deltaLongitude,
      latitudeMaximum: commune.latitude + deltaLatitude,
      longitudeMaximum: commune.longitude + deltaLongitude,
    };

    const deltaLatitudeCarte = this.calculerDeltaLatitude(rayon * 1.1);
    const deltaLongitudeCarte = this.calculerDeltaLongitude(rayon * 1.1, commune);

    this.carte.setMaxBounds([
      [commune.latitude - deltaLatitudeCarte, commune.longitude - deltaLongitudeCarte],
      [commune.latitude + deltaLatitudeCarte, commune.longitude + deltaLongitudeCarte],
    ]);
  }

  private calculerDeltaLongitude(rayon: number, commune: Commune) {
    const latitudeRadians = commune.latitude * (Math.PI / 180);
    return rayon / (111.32 * Math.cos(latitudeRadians));
  }

  private calculerDeltaLatitude(rayon: number) {
    return (180 / Math.PI) * (rayon / 6371);
  }

  public placerMarqueursEntreprises(nafRev2: NafRev2): void {
    this.groupeMarqueurs.clearLayers();
    if (this.carte) {
      this.chargement.set(true);
      this.referentiel.entreprises(nafRev2.code, this.limitesGPS!).subscribe((entreprises) => {
        if (entreprises.length > 1000) {
          alert(
            this.translate.instant('components.entreprises.carte_entreprise.trop_de_resultats', {
              nbEntreprises: entreprises.length,
            }),
          );
          entreprises = entreprises.filter((entreprise) => entreprise.codeEffectif !== 'NN');
        }
        entreprises.forEach((entreprise) => {
          L.marker([entreprise.latitude, entreprise.longitude], {
            icon: CarteEntreprises.iconeMarqueur,
          })
            .addTo(this.carte)
            .on('click', () => {
              this.outputEntrepriseSelectionnee.emit(entreprise);
            })
            .addTo(this.groupeMarqueurs)
            .bindTooltip(entreprise.etablissement, {
              permanent: true,
              offset: [10, 0],
              interactive: true,
            });
        });
        this.chargement.set(false);
      });
    }
  }
}
