import ALF from "alf-client";

export async function createClient() {
  let address = process.env.REACT_APP_ALEPHIUM_HOST;
  if (!address) { address = 'localhost'; }

  let port = process.env.REACT_APP_ALEPHIUM_PORT;
  if (!port) { port = 10973; }

  const client = new ALF.NodeClient({
    host: address,
    port: port
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
