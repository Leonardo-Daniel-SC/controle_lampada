import { Link } from "react-router-dom"

const Header = () => {
  return (
    <header className="flex text-white justify-between items-center py-2 px-[5%]">
      <h1 className="logo">Controle de <span className="destaque text-[#95ff00]">Dispositivos</span></h1>
      <nav>
        <ul className="flex list-none items-center gap-8">
          <li>
            <Link to={"/"} className="text-white text-lg no-underline hover:text-[#95ff00] transition-all">Home</Link>
          </li>
          <li>
            <Link to={""} className="text-white text-lg no-underline hover:text-[#95ff00] transition-all">Histórico</Link>
          </li>
          <li>
            <Link to={""} className="text-white text-lg no-underline hover:text-[#95ff00] transition-all">Login</Link>
          </li>
        </ul>
      </nav>
      
    </header>
  )
}

export default Header
