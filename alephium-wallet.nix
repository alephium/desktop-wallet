{ lib, stdenv , fetchurl , appimageTools , makeWrapper , electron }:

stdenv.mkDerivation rec {
  pname = "alephium-wallet";
  version = "0.10.3";

  src = fetchurl {
    url = "https://github.com/alephium/alephium-wallet/releases/download/v${version}/alephium-wallet-linux-${version}.AppImage";
    sha256 = "1hc6qp6rg8pgqafd7yhxg3ik8fsm4s5n8z8yy70sls5c10xncz22";
    name = "${pname}-${version}.AppImage";
  };

  appimageContents = appimageTools.extractType2 {
    name = "${pname}-${version}";
    inherit src;
  };

  dontUnpack = true;
  dontConfigure = true;
  dontBuild = true;

  nativeBuildInputs = [ makeWrapper ];

  installPhase = ''
    runHook preInstall

    mkdir -p $out/bin $out/share/${pname} $out/share/applications

    cp -a ${appimageContents}/{locales,resources} $out/share/${pname}
    cp -a ${appimageContents}/alephium.desktop $out/share/applications/${pname}.desktop
    cp -a ${appimageContents}/usr/share/icons $out/share

    substituteInPlace $out/share/applications/${pname}.desktop \
      --replace 'Exec=AppRun' 'Exec=${pname}'

    runHook postInstall
  '';

  postFixup = ''
    makeWrapper ${electron}/bin/electron $out/bin/${pname} \
      --add-flags $out/share/${pname}/resources/app.asar
  '';

  meta = with lib; {
    description = "Alephium desktop wallet";
    homepage = "https://github.com/alephium/alephium-wallet";
  };
}
