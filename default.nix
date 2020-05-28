with import <nixpkgs> {}; {
  sdlEnv = stdenv.mkDerivation {
    name = "alephium-webextension";
    shellHook = ''
    '';
    buildInputs = [
      nodejs electron
    ];
  };
}
