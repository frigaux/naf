import { Component, inject, OnInit, output, signal, WritableSignal } from '@angular/core';
import {
  MatTree,
  MatTreeNode,
  MatTreeNodeDef,
  MatTreeNodePadding,
  MatTreeNodeToggle,
} from '@angular/material/tree';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { Referentiel } from '../../../services/referentiel';
import { NafRev2 } from '../../../services/naf-rev2.interface';
import { form, FormField } from '@angular/forms/signals';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { MatProgressBar } from '@angular/material/progress-bar';

@Component({
  selector: 'app-selecteur-naf',
  imports: [
    MatTree,
    MatTreeNode,
    MatIcon,
    MatTreeNodeDef,
    MatTreeNodeToggle,
    MatTreeNodePadding,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    FormField,
    TranslatePipe,
    MatProgressBar,
  ],
  templateUrl: './selecteur-naf.html',
  styleUrl: './selecteur-naf.sass',
})
export class SelecteurNAF implements OnInit {
  outputNafRev2 = output<NafRev2>({ alias: 'nafRev2' });

  private referentiel = inject(Referentiel);

  private _nafRev2s?: Array<NafRev2>;

  // données pour la vue
  protected chargement: WritableSignal<boolean> = signal(true);
  public readonly nafRev2s: WritableSignal<Array<NafRev2>> = signal([]);
  protected readonly hasEnfants = (_: number, node: NafRev2) => node.enfants.length > 0;

  // formulaire
  protected readonly champRecherche = signal<string>('');
  protected readonly formulaire = form(this.champRecherche);

  ngOnInit(): void {
    this.referentiel.nafRev2().subscribe((nafRev2s) => {
      this._nafRev2s = nafRev2s;
      this.nafRev2s.set(JSON.parse(JSON.stringify(nafRev2s)));
      this.chargement.set(false);
    });
  }

  protected filtrer() {
    const recherche = this.champRecherche();
    if (this._nafRev2s) {
      this.nafRev2s.set(this._filtrer(recherche, JSON.parse(JSON.stringify(this._nafRev2s))));
    }
  }

  // TODO : recherche par code ?
  private _filtrer(recherche: string, nafRev2s: Array<NafRev2>): Array<NafRev2> {
    const resultat: Array<NafRev2> = [];
    const rechercheNormalisee = this.referentiel.normaliser(recherche);
    for (const nafRev2 of nafRev2s) {
      const idx = nafRev2.nomNormalise.indexOf(rechercheNormalisee);
      if (idx === -1) {
        const enfants = this._filtrer(recherche, nafRev2.enfants);
        if (enfants.length > 0) {
          nafRev2.enfants = enfants;
          resultat.push(nafRev2);
        }
      } else {
        const nom = nafRev2.nom;
        const lg = idx + recherche.length;
        nafRev2.nom = `${nom.substring(0, idx)}<strong>${nom.substring(idx, lg)}</strong>${nom.substring(lg, nom.length)}`;
        resultat.push(nafRev2);
      }
    }
    return resultat;
  }

  protected reinitialiser() {
    this.champRecherche.set('');
    if (this._nafRev2s) {
      this.nafRev2s.set(JSON.parse(JSON.stringify(this._nafRev2s)));
    }
  }

  protected nafClicked(node: any) {
    this.reinitialiserMatButton(this.nafRev2s());
    node.matButton = 'filled';
    this.outputNafRev2.emit(node);
  }

  private reinitialiserMatButton(nafRev2s: Array<NafRev2>) {
    for (const nafRev2 of nafRev2s) {
      nafRev2.matButton = '';
      this.reinitialiserMatButton(nafRev2.enfants);
    }
  }
}
