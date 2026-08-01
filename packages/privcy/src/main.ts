/**!
 * Cookie/Privacy consent banner script.
 *
 * @author Simon Lagerlöf <contact@smn.codes>
 * @license BSD-3-Clause
 * @copyright 2024 Simon Lagerlöf
 */

import { Privcy } from './lib/privcy';
import './styles/privcy.css';

declare global {
  interface Window {
    Privcy: typeof Privcy;
  }
}

if (typeof window !== 'undefined') {
  window.Privcy = Privcy;
}

export default Privcy;
