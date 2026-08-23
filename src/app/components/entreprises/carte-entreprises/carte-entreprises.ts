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
import { NafRev2 } from '../../../services/naf-rev2';
import * as L from 'leaflet';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Referentiel } from '../../../services/referentiel';
import { Entreprise } from '../../../services/entreprise';
import { Commune } from '../../../services/commune';
import { LatLngBounds } from 'leaflet';

@Component({
  selector: 'app-carte-entreprises',
  imports: [MatProgressBar],
  templateUrl: './carte-entreprises.html',
  styleUrl: './carte-entreprises.sass',
})
export class CarteEntreprises implements AfterViewInit {
  outputEntrepriseSelectionnee = output<Entreprise>({ alias: 'entrepriseSelectionnee' });

  private referentiel = inject(Referentiel);

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
    this.carte.setZoom(rayon < 10 ? 12 : rayon < 30 ? 11 : 10);
    this.carte.setView([commune.latitude, commune.longitude]);
    const deltaLatitude = (180 / Math.PI) * (rayon / 6371);
    const deltaLongitude = (180 / Math.PI) * (rayon / (6371 * Math.cos(commune.longitude)));
    this.carte.setMaxBounds([
      [commune.latitude - deltaLatitude, commune.longitude - deltaLongitude],
      [commune.latitude + deltaLatitude, commune.longitude + deltaLongitude],
    ]);
  }

  public placerMarqueursEntreprises(nafRev2: NafRev2): void {
    this.groupeMarqueurs.clearLayers();

    if (this.carte) {
      this.chargement.set(true);
      this.referentiel
        .entreprises(nafRev2.code, this.carte.options.maxBounds as LatLngBounds)
        .subscribe((entreprises) => {
          entreprises.forEach((entreprise) => {
            L.marker([entreprise.latitude, entreprise.longitude], {
              icon: CarteEntreprises.iconeMarqueur,
            })
              .addTo(this.carte)
              .on('mouseover', () => {
                this.outputEntrepriseSelectionnee.emit(entreprise);
              })
              .addTo(this.groupeMarqueurs);
          });
          this.chargement.set(false);
        });
    }
  }
}
