import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import LogInButtons from 'flarum/forum/components/LogInButtons';
import LogInButton from 'flarum/forum/components/LogInButton';
import extractText from 'flarum/common/utils/extractText';
import Tooltip from 'flarum/common/components/Tooltip';
import LogInModal from 'flarum/forum/components/LogInModal';
import SignUpModal from 'flarum/forum/components/SignUpModal';
import ForumApplication from 'flarum/forum/ForumApplication';

export default function () {
  extend(LogInButtons.prototype, 'items', function (items) {
    const onlyIcons = !!app.forum.attribute('fof-oauth.only_icons');
    const buttons = app.forum.attribute('fof-oauth').filter(Boolean);
    const googleButton = buttons.splice(buttons.indexOf(buttons.find((b) => b.name === 'google')), 1);

    buttons.concat(googleButton).forEach(({ name, icon, priority }) => {
      let className = `Button FoFLogInButton LogInButton--${name}`;

      // Google branding does not allow inline icon, so we'll keep the full button
      if (onlyIcons && name !== 'google') {
        className += ' Button--icon';
      }

      items.add(
        name,
        <div className={`LogInButtonContainer LogInButtonContainer--${name}`}>
          <LogInButton className={className} icon={icon} path={`/auth/${name}`} disabled={app.fof_oauth_loginInProgress}>
            {app.translator.trans(`fof-oauth.forum.log_in.with_${name}_button`, {
              provider: app.translator.trans(`fof-oauth.forum.providers.${name}`),
            })}
          </LogInButton>
        </div>,
        priority
      );
    });
  });

  override(LogInButton.prototype, 'view', function (orig, vnode) {
    const onlyIcons = !!app.forum.attribute('fof-oauth.only_icons');
    if (!onlyIcons) return orig(vnode);

    const child = orig(vnode);

    return <Tooltip text={extractText(child.children[1])}>{child}</Tooltip>;
  });

  extend(LogInButtons.prototype, 'view', function (vdom) {
    const onlyIcons = !!app.forum.attribute('fof-oauth.only_icons');
    if (!onlyIcons) return;

    vdom.attrs.className += ' FoFLogInButtons--icons';
  });

  extend(ForumApplication.prototype, 'authenticationComplete', function (_, payload) {
    if (payload.loggedIn) {
      app.fof_oauth_loginInProgress = true;
      // This will automatically be reset, as authenticationComplete also triggers a window reload.

      m.redraw();
    }
  });

  extend(LogInModal.prototype, 'onbeforeupdate', function (vnode) {
    if (app.fof_oauth_loginInProgress) {
      this.loading = true;
    }
  });

  extend(SignUpModal.prototype, 'onbeforeupdate', function (vnode) {
    if (app.fof_oauth_loginInProgress) {
      this.loading = true;
    }
  });

  extend(SignUpModal.prototype, 'fields', function (items) {
    // If a suggested username was not provided by the OAuth service, display some help text to the user.
    if (!!this.attrs.token && !!!this.attrs.username) {
      items.add(
        'username-help',
        <div>
          <p>{app.translator.trans('fof-oauth.forum.signup.username_help')}</p>
        </div>,
        35
      );
    }

    return items;
  });
}
