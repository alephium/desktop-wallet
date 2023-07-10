{ lib, stdenv , fetchurl , appimageTools , makeWrapper , electron }:

appimageTools.wrapType1 rec {
  name = "alephium-wallet";
  version = "2.0.2";

  src = fetchurl {
    url = "https://github.com/alephium/desktop-wallet/releases/download/v${version}/Alephium-${version}.AppImage";
    sha256 = "9853c2aafa3b608a4f2f623129accb499ba25a1201ecb82c7a4c773d6a51f65b";
  };
}
