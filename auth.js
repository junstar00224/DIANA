(() => {
  const login = document.querySelector('#login-button');
  const account = document.querySelector('#account-menu');
  const status = document.querySelector('#auth-status');
  let ready;
  function loadScript(src, key) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.crossOrigin = 'anonymous';
      if (key) script.dataset.clerkPublishableKey = key;
      const timeout = setTimeout(() => { script.remove(); reject(new Error('timeout')); }, 20000);
      script.onload = () => { clearTimeout(timeout); resolve(); };
      script.onerror = () => { clearTimeout(timeout); script.remove(); reject(new Error('load_failed')); };
      document.head.append(script);
    });
  }
  async function initialize() {
    const key = window.DIANA_AUTH?.publishableKey;
    if (!key) throw new Error('missing_config');
    const domain = atob(key.split('_')[2]).replace(/\$$/, '');
    if (!/^[a-z0-9.-]+$/i.test(domain)) throw new Error('invalid_domain');
    await loadScript(`https://${domain}/npm/@clerk/ui@1/dist/ui.browser.js`);
    await loadScript(`https://${domain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`, key);
    const clerk = window.Clerk;
    await clerk.load({
      ui: { ClerkUI: window.__internal_ClerkUICtor },
      localization: {
        signIn: { start: { title: 'Welcome to DIANA', subtitle: '구글 계정으로 간편하게 시작하세요.' } }
      },
      signInFallbackRedirectUrl: window.location.origin,
      signUpFallbackRedirectUrl: window.location.origin,
      afterSignOutUrl: window.location.origin,
      appearance: {
        variables: { colorPrimary: '#756347', colorBackground: '#fbfaf7', colorText: '#29261f', borderRadius: '4px', fontFamily: 'Poppins, sans-serif' },
        elements: { headerTitle: { fontFamily: '"Playfair Display", serif', fontWeight: '400', fontSize: '28px' } }
      }
    });
    let mounted = false;
    clerk.addListener(({ user, session }) => {
      const signedIn = Boolean(user && session);
      login.hidden = signedIn;
      account.hidden = !signedIn;
      if (signedIn && !mounted) {
        clerk.mountUserButton(account, { showName: true });
        mounted = true;
      } else if (!signedIn && mounted) {
        clerk.unmountUserButton(account);
        mounted = false;
      }
    });
    return clerk;
  }
  function start() {
    if (!ready) ready = initialize().catch(error => { ready = null; throw error; });
    return ready;
  }
  login.addEventListener('click', async () => {
    login.disabled = true;
    status.textContent = '로그인 화면을 불러오는 중입니다…';
    try {
      const clerk = await start();
      status.textContent = '';
      clerk.openSignIn();
    } catch {
      status.textContent = '로그인 서비스를 불러오지 못했습니다. 잠시 후 로그인 버튼을 다시 눌러 주세요.';
    } finally {
      login.disabled = false;
    }
  });
  start().catch(() => { /* Keep browsing available; show a retry message on explicit sign-in. */ });
})();
