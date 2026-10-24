import Card from "../components/Card"


const Home = () => {

  const Home = ({ dispositivos }) => (
    <main className="px-[5%] mb-16 grow">
      <section className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6">
        {dispositivos.map((dispositivo) => (
          <Card key={dispositivo.id} id={dispositivo.id} titulo={dispositivo.titulo} />
        ))}
      </section>
    </main>
  );

  // const card= [
  //   // {id:1, titulo:"dispositivo-001"},
  //   // {id:2, titulo:"dispositivo-002"},
  //   // {id:3, titulo:"dispositivo-003"},
  // ]

  // return (
  //   <main className="px-[5%] mb-16 grow">
  //     {/* É aqui que os cards ficam um do lado do outro */}
  //     <section className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6">
  //       {card.map((dispositivo) =>(
  //         <Card
  //           key={dispositivo.id}
  //           titulo={dispositivo.titulo}
  //         />
  //       ))}

  //     </section>
  //   </main>
  // )
}

export default Home
