with import <nixpkgs> {}; {
  sdlEnv = stdenv.mkDerivation {
    name = "alephium-wallet";
    shellHook = ''
    '';
    buildInputs = [
      python nodejs electron
    ];
  };
}
