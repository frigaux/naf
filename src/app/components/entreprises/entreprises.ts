import { Component, OnInit, signal, ViewChild, viewChild, WritableSignal } from '@angular/core';
import { SelecteurNAF } from './selecteur-naf/selecteur-naf';
import { CarteEntreprises } from './carte-entreprises/carte-entreprises';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { TranslatePipe } from '@ngx-translate/core';
import { NafRev2 } from '../../services/naf-rev2';
import { FicheEntreprise } from './fiche-entreprise/fiche-entreprise';
import { Entreprise } from '../../services/entreprise';

@Component({
  selector: 'app-entreprises',
  imports: [
    SelecteurNAF,
    CarteEntreprises,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    TranslatePipe,
    MatExpansionPanelDescription,
    FicheEntreprise,
  ],
  templateUrl: './entreprises.html',
  styleUrl: './entreprises.sass',
})
export class Entreprises implements OnInit {
  private panneauSelecteur = viewChild.required<MatExpansionPanel>('panneauSelecteur');
  private panneauCarte = viewChild.required<MatExpansionPanel>('panneauCarte');

  private carteEntreprises = viewChild.required<CarteEntreprises>('carteEntreprises');
  private ficheEntreprise = viewChild.required<FicheEntreprise>('ficheEntreprise');

  // données pour la vue
  protected nafRev2: WritableSignal<NafRev2 | undefined> = signal(undefined);

  // TODO : sélecteur de ville et rayon affichage des marqueurs
  // TODO : regénérer les JSON des entreprises

  ngOnInit(): void {
    this.panneauSelecteur().open();
    this.panneauCarte().close();
  }

  protected afficherCarte(nafRev2: NafRev2) {
    this.nafRev2.set(nafRev2);
    this.panneauSelecteur().close();
    this.panneauCarte().open();
    this.carteEntreprises().placerMarqueursEntreprises(nafRev2);
    this.ficheEntreprise().reinitialiser();
  }

  protected afficherEntreprise(entreprise: Entreprise) {
    this.ficheEntreprise().afficher(entreprise);
  }
}
