export default function Savjeti() {
  const savjeti = [
    {
      title: "Kako napisati kvalitetan životopis",
      content:
        "Koristite jasan format, fokusirajte se na postignuća i prilagodite sadržaj svakoj prijavi. Dodajte LinkedIn i kontakte.",
    },
    {
      title: "Kako se pripremiti za razgovor za posao",
      content:
        "Istražite tvrtku, uvježbajte odgovore na česta pitanja i pripremite pitanja za poslodavca. Odjenite se profesionalno.",
    },
    {
      title: "Kako pronaći praksu ili staž",
      content:
        "Posjetite karijerne centre, pratite objave na webu Sveučilišta i uključite se u studentske udruge koje nude prilike.",
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-blue-600 mb-4">Savjeti za studente</h2>
      <div className="space-y-4">
        {savjeti.map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
            <p className="text-gray-700">{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
