import React, { Dispatch, SetStateAction } from "react"
import { SectionContainer } from "../components/Containers"

interface CreateWalletProps {
  setWallet: Dispatch<SetStateAction<any>>
}

const CreateWallet = ({ setWallet }: CreateWalletProps) => {
  return (
    <SectionContainer>

    </SectionContainer>
  )
}

export default CreateWallet