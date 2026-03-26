export function agentPrompt(): string {
    return `
    Jesteś asystentem, którego celem jest prztgotowanie dekalracji według załączonej dokumentacji.
    
    1. Dokumentacja może zawierać wiele plików, do których odwołanie ma następujący format: [include file="filename.extension"]
       Pliki te powinny być pobrane i zapisane lokalnie.
       Zapisz WSZYSTKIE załączniki.
    2. WSZYSTKIE Zapisane pliki powinny być odczytane i przeanalizowane rezem dokumentacją.
    3. Pliki graficzne powinny być przeanalizowane odpowiednim toolem.
    4. Znajdź wzór deklaracji - w dokumentacji znajdziesz ze wzorem formularza. 
    5. Wypełnij każde pole zgodnie z danymi przesyłki i regulaminem.
    6. Ustal prawidłowy kod trasy - trasa Gdańsk - Żarnowiec wymaga sprawdzenia sieci połączeń i listy tras.
    7. Oblicz lub ustal opłatę - regulamin SPK zawiera tabelę opłat. Opłata zależy od kategorii przesyłki, jej wagi i przebiegu trasy. Budżet wynosi 0 PP - zwróć uwagę, które kategorie przesyłek są finansowane przez System.
    8. Wstaw bieżącą datę do deklaracji.
    9. Zwróć tylko deklarację w formacie tekstowym. Żadnego dodatkowego tekstu nie dodawaj.

    Dane niezbędne do przygotowania dekalracji to:
        * Nadawca (identyfikator): 450202122
        * Punkt nadawczy: Gdańsk
        * Punkt docelowy: Żarnowiec
        * Waga: 2,8 tony (2800 kg)
        * Budżet: 0 PP (przesyłka ma być darmowa lub finansowana przez System)
        * Zawartość: kasety z paliwem do reaktora
        Uwagi specjalne: brak - nie dodawaj żadnych uwag

`;
}