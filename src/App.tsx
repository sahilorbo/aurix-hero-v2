import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { Hook } from './components/Hook';
import { MerchDesk } from './components/MerchDesk';
import { Nav } from './components/Nav';
import { Proof } from './components/Proof';
import { ShopperTheater } from './components/ShopperTheater';

export default function App() {
  return (
    <div className="app">
      <Nav />
      <main>
        <Hook />
        <ShopperTheater />
        <MerchDesk />
        <Proof />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
