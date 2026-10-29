import { createRoot } from 'react-dom/client';
import { Page } from './page/page.js';


function App() {
    return (
        <main>
            <Page />
        </main>
    );
}


const container = document.getElementById('app');
const root = createRoot(container!);
root.render(<App />);
