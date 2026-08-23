import {
  Component,
  ElementRef,
  inject,
  OnInit,
  output,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { Referentiel } from '../../../services/referentiel';
import { Commune } from '../../../services/commune';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatProgressBar } from '@angular/material/progress-bar';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { CarteEntreprises } from '../carte-entreprises/carte-entreprises';

@Component({
  imports: [
    MatFormField,
    MatLabel,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatOption,
    MatProgressBar,
    ReactiveFormsModule,
    MatInput,
    TranslatePipe,
    MatSlider,
    MatSliderThumb,
    FormsModule,
  ],
  selector: 'app-selecteur-commune',
  styleUrl: './selecteur-commune.sass',
  templateUrl: './selecteur-commune.html',
})
export class SelecteurCommune implements OnInit {
  outputCommune = output<Commune>({ alias: 'commune' });
  outputRayon = output<number>({ alias: 'rayon' });

  private referentiel = inject(Referentiel);

  protected nom: FormControl<string> = new FormControl();
  protected rayon: FormControl<number> = new FormControl();

  // données pour la vue
  protected chargement: WritableSignal<boolean> = signal(true);
  protected readonly communes: WritableSignal<Array<Commune>> = signal<Array<Commune>>([]);
  protected readonly communesFiltrees: WritableSignal<Array<Commune>> = signal<Array<Commune>>([]);

  constructor() {
    this.nom.valueChanges.subscribe((o) => {
      if (typeof o === 'string') {
        this.filtrerCommunes(o);
      } else {
        this.outputCommune.emit(o);
      }
    });
  }

  ngOnInit(): void {
    this.rayon.setValue(25);
    this.outputRayon.emit(25);
    this.referentiel.communes().subscribe((communes) => {
      this.communes.set(communes);
      this.chargement.set(false);
    });
  }

  filtrerCommunes(nom: string): void {
    if (typeof nom === 'string') {
      const nomNormalise = this.referentiel.normaliser(nom);
      if (nomNormalise.length > 2) {
        this.communesFiltrees.set(
          this.communes().filter((commune) => commune.nomNormalise.includes(nomNormalise)),
        );
      }
    }
  }

  protected rayonModifie() {
    this.outputRayon.emit(this.rayon.value);
  }
}
