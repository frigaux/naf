import csv, re

class NAFtoJSON:
    """Conversion du fichier csv listant les codes NAF vers une structure JSON"""

    currentLevel = 0
    level2 = re.compile(r"^\d{2}$")
    level3 = re.compile(r"^\d{2}\.\d$")
    level4 = re.compile(r"^\d{2}\.\d{2}Z?$")

    def convert(self):
        with open('./json/NAFREV2.json', 'w', encoding="utf-8") as jsonFile:
            jsonFile.write('{\n')
            with open('./data/int_courts_naf_rev_2.csv', 'r', encoding="utf-8") as csvFile:
                csvReader = csv.reader(csvFile, delimiter=';', quotechar='"')
                previousRow = None
                for row in csvReader:
                    naf = row[1]
                    libelle = row[2]
                    if (naf.startswith('SECTION')):
                        self._addClosingBrace(1, jsonFile)
                        jsonFile.write(f'"{libelle.strip()}":' + ' {\n')
                        self.currentLevel += 1
                    elif (self.level2.match(naf)):
                        self._addClosingBrace(2, jsonFile)
                        jsonFile.write(f'"{libelle.strip()}":' + ' {\n')
                        self.currentLevel += 1
                    elif (self.level3.match(naf)):
                        self._addClosingBrace(3, jsonFile)
                        jsonFile.write(f'"{libelle.strip()}":' + ' {\n')
                        self.currentLevel += 1
                    elif (self.level4.match(naf)):
                        if (previousRow == None or previousRow[2].strip() != libelle.strip()):
                            jsonFile.write("" + f'"{naf.strip()}":"{libelle.strip()}"' + ',\n')
                        previousRow = row

            jsonFile.write('}\n}\n}\n}')

    def _addClosingBrace(self, level, jsonFile):
        for i in range(level, self.currentLevel):
            jsonFile.write('}')
            if (i == self.currentLevel - 1):
                jsonFile.write(',')
            jsonFile.write('\n')
        self.currentLevel = level

NAFtoJSON().convert()

