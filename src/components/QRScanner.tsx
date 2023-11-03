/*
Copyright 2018 - 2023 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/
import { Html5Qrcode } from 'html5-qrcode'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import Select, { SelectOption } from '@/components/Inputs/Select'

interface QRScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void
  onScanFailure: (error: any) => void
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanFailure = () => null }) => {
  const scannerId = 'qrScannerElement'
  const [deviceOptions, setDeviceOptions] = useState<SelectOption<string>[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const previousSelectedDeviceId = useRef<string | null>(null)

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((deviceList) => {
        const videoDevices = deviceList.filter((device) => device.kind === 'videoinput')
        setDeviceOptions(videoDevices.map((d) => ({ label: d.label, value: d.deviceId })))
      })
      .catch((error) => {
        console.error('Failed to get devices:', error)
      })
  }, [])

  useEffect(() => {
    if (!selectedDeviceId) return

    html5QrCodeRef.current = new Html5Qrcode(scannerId)

    const html5QrCode = html5QrCodeRef.current

    previousSelectedDeviceId.current = selectedDeviceId

    const startScanner = () => {
      html5QrCode
        .start(
          selectedDeviceId,
          {
            fps: 10,
            qrbox: { width: 300, height: 300 }
          },
          onScanSuccess,
          onScanFailure
        )
        .catch((error) => {
          onScanFailure(error)
        })
    }

    if (!html5QrCode.isScanning) {
      startScanner()
    }

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch((error) => {
          console.error('Error stopping the QR scanner', error)
        })
      }
    }
  }, [selectedDeviceId, onScanSuccess, onScanFailure])

  return (
    <ScannerContainer>
      <Scanner id={scannerId} />
      <Select
        id="cameraSelect"
        label="Camera"
        title="Camera"
        options={deviceOptions}
        onSelect={setSelectedDeviceId}
        controlledValue={deviceOptions.find((d) => d.value === selectedDeviceId) || deviceOptions[0]}
      />
    </ScannerContainer>
  )
}

export default QRScanner

const ScannerContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const Scanner = styled.div`
  flex: 1;
  min-height: 400px;
  background-color: ${({ theme }) => theme.bg.secondary};
`
