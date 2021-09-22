with import <nixpkgs> {};
let
  alephium-wallet = pkgs.callPackage ./alephium-wallet.nix {};
in
pkgs.mkShell {
  name = "alephium-wallet";
  buildInputs = [ alephium-wallet ];
}
