import app from 'flarum/forum/app';
import addLinkedAccountsToUserSecurityPage from './extenders/addLinkedAccountsToUserSecurityPage';
import extendLoginSignup from './extenders/extendLoginSignup';

export { default as extend } from './extend';

export * from './components';
export * from './utils';

app.initializers.add('fof/oauth', () => {
  extendLoginSignup();
  addLinkedAccountsToUserSecurityPage();
});
