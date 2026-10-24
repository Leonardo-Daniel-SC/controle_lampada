import Card from "../components/Card";

const Home = ({ dispositivos }) => (
  <main className="px-[5%] mb-16 grow">
    <section className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6">
      {dispositivos.map((dispositivo) => (
        <Card
          key={dispositivo.id}
          id={dispositivo.id}
          titulo={dispositivo.titulo}
        />
      ))}
    </section>
  </main>
);

export default Home;
