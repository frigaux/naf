import { Component, OnInit, signal, viewChild, WritableSignal } from '@angular/core';
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
import { NafRev2 } from '../../services/naf-rev2.interface';
import { FicheEntreprise } from './fiche-entreprise/fiche-entreprise';
import { Entreprise } from '../../services/entreprise.interface';
import { SelecteurCommune } from './selecteur-commune/selecteur-commune';
import { Commune } from '../../services/commune.interface';

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
    SelecteurCommune,
  ],
  templateUrl: './entreprises.html',
  styleUrl: './entreprises.sass',
})
export class Entreprises implements OnInit {
  private panneauSelecteurs = viewChild.required<MatExpansionPanel>('panneauSelecteurs');
  private panneauCarte = viewChild.required<MatExpansionPanel>('panneauCarte');

  private carteEntreprises = viewChild.required<CarteEntreprises>('carteEntreprises');
  private ficheEntreprise = viewChild.required<FicheEntreprise>('ficheEntreprise');

  // données pour la vue
  protected nafRev2Selectionnee: WritableSignal<NafRev2 | undefined> = signal(undefined);

  private communeSelectionnee?: Commune;
  private rayonSelectionne?: number;

  ngOnInit(): void {
    this.panneauSelecteurs().open();
    this.panneauCarte().close();
  }

  private afficherCarte() {
    if (this.communeSelectionnee && this.rayonSelectionne && this.nafRev2Selectionnee()) {
      this.panneauSelecteurs().close();
      this.panneauCarte().open();
      this.carteEntreprises().positionner(this.communeSelectionnee, this.rayonSelectionne);
      this.carteEntreprises().placerMarqueursEntreprises(this.nafRev2Selectionnee()!);
      this.ficheEntreprise().reinitialiser();
    }
  }

  protected afficherEntreprise(entreprise: Entreprise) {
    this.ficheEntreprise().afficher(entreprise);
  }

  protected definirCommune(commune: Commune) {
    this.communeSelectionnee = commune;
    this.afficherCarte();
  }

  protected definirRayon(rayon: number) {
    this.rayonSelectionne = rayon;
  }

  protected definirNafRev2(nafRev2: NafRev2) {
    this.nafRev2Selectionnee.set(nafRev2);
    this.afficherCarte();
  }
}
