import 'intl';
import 'intl/locale-data/jsonp/en';
import 'intl/locale-data/jsonp/tr';
import 'intl-pluralrules';
import 'react-native-gesture-handler';



import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import i18n from './src/i18n/i18n';'./i18n'; // i18n ayarlarını içe aktarın

AppRegistry.registerComponent(appName, () => App);
