import csv, re, os

class EtablissementToJSON:
    """Conversion du fichier csv listant les établissements vers une structure JSON par section NAF"""

    level3 = re.compile(r"^\d{2}\.\d$")

    def convert(self, sousSectionNAF):
        print(f'Conversion pour la sous section : {sousSectionNAF}')
        inputFile = './data/StockEtablissement_utf8.csv'
        outputFile = f'./json/{sousSectionNAF}.json'
        if not os.path.exists(outputFile):
            with open(outputFile, 'w', encoding="utf-8") as jsonFile:
                jsonFile.write('[')
                with open(inputFile, 'r', encoding="utf-8") as csvFile:
                    csvReader = csv.reader(csvFile, delimiter=',', quotechar='"')
                    self._convertRows(csvReader, jsonFile, sousSectionNAF)
                jsonFile.write('\n]')

    def _convertRows(self, csvReader: Reader, jsonFile: TextIOWrapper[_WrappedBuffer], sousSectionNAF):
        firstRow = True
        for row in csvReader:
            diffusion = row[3] == 'O'
            actif = row[45] == 'A'
            etablissement = row[46]
            naf = row[50]
            nafRev2 = row[51] == 'NAFRev2'
            coordonneeLambertAbscisse = row[28]
            coordonneeLambertOrdonnee = row[29]
            if (
                    diffusion and actif and etablissement and coordonneeLambertAbscisse
                    and coordonneeLambertOrdonnee and etablissement != '[ND]'
                    and nafRev2 and naf.startswith(sousSectionNAF)):
                codeEffectif = row[5]
                siret = row[2]
                dateCreation = row[4]
                etablissementSiege = row[9]
                typeVoie = row[16]
                voie = row[17]
                codePostal = row[18]
                commune = row[19]
                if (not firstRow):
                    jsonFile.write(",")
                firstRow = False
                jsonFile.write("\n  {\n"
                               f'    "etablissement": "{etablissement.strip()}",\n'
                               f'    "naf": "{naf.strip()}",\n'
                               f'    "siret": "{siret.strip()}",\n'
                               f'    "codeEffectif": "{codeEffectif.strip()}",\n'
                               f'    "dateCreation": "{dateCreation.strip()}",\n'
                               f'    "etablissementSiege": {etablissementSiege},\n'
                               f'    "typeVoie": "{typeVoie.strip()}",\n'
                               f'    "voie": "{voie.strip()}",\n'
                               f'    "codePostal": "{codePostal.strip()}",\n'
                               f'    "commune": "{commune.strip()}",\n'
                               f'    "coordonneeLambertAbscisse": {coordonneeLambertAbscisse},\n'
                               f'    "coordonneeLambertOrdonnee": {coordonneeLambertOrdonnee}\n'
                               "  }")

    def convertAll(self):
        with open('./data/int_courts_naf_rev_2.csv', 'r', encoding="utf-8") as csvFile:
            csvReader = csv.reader(csvFile, delimiter=';', quotechar='"')
            for row in csvReader:
                naf = row[1]
                if (self.level3.match(naf)):
                    self.convert(naf)


EtablissementToJSON().convertAll()
