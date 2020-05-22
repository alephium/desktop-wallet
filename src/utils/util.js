import ALF from "alf-client";

export async function createClient() {
  let settings = settingsLoadOrDefault();
  const client = new ALF.NodeClient({
    host: settings.host,
    port: settings.port
  });

  console.log('Connecting to: ' + client.host + ':' + client.port);

  const response = await client.selfClique();
  if (!response) {
    console.log('Self clique not found.');
    return;
  }

  const clique = new ALF.CliqueClient(response.result);
  return clique;
}

export function settingsDefault() {
  return {
        host: 'localhost',
        port: 10973
  }
}

export function settingsLoad() {
  const str = window.localStorage.getItem('settings');
  if (typeof str !== 'undefined') {
    return JSON.parse(str);
  } else {
    return null;
  }
}

export function settingsLoadOrDefault() {
  const settings = settingsLoad();
  if (!settings) {
    return settingsDefault();
  } else {
    return settings;
  }
}

export function settingsSave(settings) {
  const str = JSON.stringify(settings);
  window.localStorage.setItem('settings', str);
}

export const useStyles = theme => ({
  root: {
    padding: 24,
  },
  section: {
    paddingBottom: 42,
  },
  form: {
    width: 600,
    margin: 'auto',
  },
  field: {
    width: 600,
  }
});
