import { Component, signal, WritableSignal } from '@angular/core';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Entreprise } from '../../../services/entreprise.interface';

@Component({
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    DatePipe,
    TranslatePipe,
  ],
  selector: 'app-fiche-entreprise',
  styleUrl: './fiche-entreprise.sass',
  templateUrl: './fiche-entreprise.html',
})
export class FicheEntreprise {
  protected entreprise: WritableSignal<Entreprise | undefined> = signal(undefined);

  reinitialiser() {
    this.entreprise.set(undefined);
  }

  afficher(entreprise: Entreprise): void {
    this.entreprise.set(entreprise);
  }
}
