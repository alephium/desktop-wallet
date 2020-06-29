with import <nixpkgs> {}; {
  sdlEnv = stdenv.mkDerivation {
    name = "alephium-webextension";
    shellHook = ''
    '';
    buildInputs = [
      python nodejs electron
    ];
  };
}
