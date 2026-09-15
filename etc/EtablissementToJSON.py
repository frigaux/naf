import csv, re, os
from typing import Any

from pyproj import Transformer
from io import Reader, TextIOWrapper


class EtablissementToJSON:
    """Conversion du fichier csv listant les établissements vers une structure JSON par section NAF"""

    level3 = re.compile(r"^\d{2}\.\d$")
    lambert93_to_wgs84 = Transformer.from_crs("EPSG:2154", "EPSG:4326", always_xy=True)

    def convertAllSousSectionNAF(self):
        sousSectionsNAF = self._getSousSectionsNAF()
        fichierBySousSectionNAF = self._openFichierBySousSectionNAF(sousSectionsNAF)

        inputFile = './data/StockEtablissement_utf8.csv'
        with open(inputFile, 'r', encoding="utf-8") as csvFile:
            csvReader = csv.reader(csvFile, delimiter=',', quotechar='"')
            self._convertRows(csvReader, fichierBySousSectionNAF)

        self._closeFichierBySousSectionNAF(fichierBySousSectionNAF)

    def _convertRows(self, csvReader: Reader, fichierBySousSectionNAF: dict[str, TextIOWrapper]):
        for row in csvReader:
            etablissement = row[46] # enseigne1Etablissement
            siret = row[2]
            if (not etablissement or etablissement == '[ND]'):
                etablissement = row[49] # denominationUsuelleEtablissement
            self._writeEtablissement(etablissement, fichierBySousSectionNAF, row, siret)

    def convertAllSousSectionNAF2FromUniteOnly(self):
        uniteBySiren = self._convertUnitesToDict()
        sousSectionsNAF = self._getSousSectionsNAF()
        fichierBySousSectionNAF = self._openFichierBySousSectionNAF(sousSectionsNAF)

        inputFile = './data/StockEtablissement_utf8.csv'
        with open(inputFile, 'r', encoding="utf-8") as csvFile:
            csvReader = csv.reader(csvFile, delimiter=',', quotechar='"')
            self._convertRowsFromUniteOnly(csvReader, fichierBySousSectionNAF, uniteBySiren)

        self._closeFichierBySousSectionNAF(fichierBySousSectionNAF)

    def _convertRowsFromUniteOnly(self, csvReader: Reader, fichierBySousSectionNAF: dict[str, TextIOWrapper], uniteBySiren: dict[str, str]):
        for row in csvReader:
            etablissement = row[46] # enseigne1Etablissement
            siret = row[2]
            if (not etablissement or etablissement == '[ND]'):
                etablissement = row[49] # denominationUsuelleEtablissement
            if (not etablissement or etablissement == '[ND]'):
                etablissement = uniteBySiren[siret[0:9]]
                self._writeEtablissement(etablissement, fichierBySousSectionNAF, row, siret)

    def _writeEtablissement(self, etablissement: str | Any,
                            fichierBySousSectionNAF: dict[str, TextIOWrapper], row, siret):
        diffusion = row[3] == 'O'
        actif = row[45] == 'A'
        naf = row[50]
        nafRev2 = row[51] == 'NAFRev2'
        coordonneeLambertAbscisse = row[28]
        coordonneeLambertOrdonnee = row[29]
        if (len(naf) > 3 and naf[0:4] in fichierBySousSectionNAF
                and diffusion and actif and etablissement and coordonneeLambertAbscisse
                and coordonneeLambertOrdonnee and etablissement != '[ND]' and nafRev2):
            codeEffectif = row[5]
            dateCreation = row[4]
            etablissementSiege = row[9]
            typeVoie = row[16]
            voie = row[17]
            codePostal = row[18]
            commune = row[19]
            longitude, latitude = self.lambert93_to_wgs84.transform(coordonneeLambertAbscisse,
                                                                    coordonneeLambertOrdonnee)
            fichierBySousSectionNAF.get(naf[0:4]).write("  {\n"
                                                        f'    "etablissement": "{re.sub(r'["\t\\]', ' ', etablissement.strip())}",\n'
                                                        f'    "naf": "{naf.strip()}",\n'
                                                        f'    "siret": "{siret.strip()}",\n'
                                                        f'    "codeEffectif": "{codeEffectif.strip()}",\n'
                                                        f'    "dateCreation": "{dateCreation.strip()}",\n'
                                                        f'    "etablissementSiege": {etablissementSiege},\n'
                                                        f'    "typeVoie": "{typeVoie.strip()}",\n'
                                                        f'    "voie": "{voie.strip()}",\n'
                                                        f'    "codePostal": "{codePostal.strip()}",\n'
                                                        f'    "commune": "{commune.strip()}",\n'
                                                        f'    "longitude": {longitude},\n'
                                                        f'    "latitude": {latitude}\n'
                                                        "  },\n")

    def _convertUnitesToDict(self) -> dict[str, str]:
        uniteBySiren = dict[str, str]([])
        inputFile = './data/StockUniteLegale_utf8.csv'
        with open(inputFile, 'r', encoding="utf-8") as csvFile:
            csvReader = csv.reader(csvFile, delimiter=',', quotechar='"')
            for row in csvReader:
                siren = row[0]
                nom = row[21] # nomUniteLegale
                denomination = row[23] # denominationUniteLegale
                if (denomination):
                    uniteBySiren[siren] = denomination
                else:
                    uniteBySiren[siren] = nom
        return uniteBySiren

    def _getSousSectionsNAF(self) -> list[str]:
        sousSectionsNAF = list[str]()
        with open('./data/int_courts_naf_rev_2.csv', 'r', encoding="utf-8") as csvFile:
            csvReader = csv.reader(csvFile, delimiter=';', quotechar='"')
            for row in csvReader:
                naf = row[1]
                if (self.level3.match(naf)):
                    sousSectionsNAF.append(naf)
        return sousSectionsNAF

    def _openFichierBySousSectionNAF(self, sousSectionsNAF) -> dict[str, TextIOWrapper]:
        fichierBySousSectionNAF = dict[str, TextIOWrapper]()
        for sousSectionNAF in sousSectionsNAF:
            nomFichier = f'./json/sirene/{sousSectionNAF}.json'
            fichier = open(nomFichier, 'w', encoding="utf-8")
            fichierBySousSectionNAF[sousSectionNAF] = fichier
            fichier.write('[\n')
        return fichierBySousSectionNAF

    def _closeFichierBySousSectionNAF(self, fichierBySousSectionNAF: dict[str, TextIOWrapper]):
        for sousSectionNAF, fichier in fichierBySousSectionNAF.items():
            taille = fichier.tell()
            if taille > 3:
                fichier.seek(taille - 3)
                fichier.truncate()
                fichier.write('\n')
            fichier.write(']')
            fichier.close()


EtablissementToJSON().convertAllSousSectionNAF2FromUniteOnly()
