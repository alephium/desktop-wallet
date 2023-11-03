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
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import Select from '@/components/Inputs/Select'

type DeviceOption = { label: string; value: string }

interface QRScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void
  onScanFailure: (error: any) => void
  videoWidth?: number
  videoHeight?: number
}

const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onScanFailure = () => null,
  videoWidth = 300,
  videoHeight = 300
}) => {
  const scannerId = 'qrScannerElement'
  const [isScannerRunning, setIsScannerRunning] = useState(false)
  const [deviceOptions, setDeviceOptions] = useState<DeviceOption[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined)

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
    const html5QrCode = new Html5Qrcode(scannerId)

    if (!selectedDeviceId) return

    // Function to start the scanner
    const startScanner = () => {
      html5QrCode
        .start(
          selectedDeviceId,
          {
            fps: 10,
            qrbox: { width: videoWidth, height: videoHeight }
          },
          onScanSuccess,
          onScanFailure
        )
        .then(() => {
          setIsScannerRunning(true)
        })
        .catch((error) => {
          onScanFailure(error)
        })
    }

    // Check if the scanner is not already running before starting it
    if (selectedDeviceId && !isScannerRunning) {
      startScanner()
    }

    // Cleanup function to stop the scanner
    return () => {
      if (isScannerRunning && html5QrCode.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
        html5QrCode.stop().finally(() => {
          setIsScannerRunning(false)
        })
      }
    }
  }, [selectedDeviceId, onScanSuccess, onScanFailure, videoWidth, videoHeight, isScannerRunning])

  return (
    <ScannerContainer>
      <div id={scannerId} style={{ width: videoWidth, height: videoHeight }} />
      <DeviceSelect
        label="Camera"
        options={deviceOptions}
        onSelect={(v) => {
          if (v !== selectedDeviceId) {
            setSelectedDeviceId(v)
          }
        }}
        controlledValue={deviceOptions.find((d) => d.value === selectedDeviceId) || deviceOptions[0] || ''}
      />
    </ScannerContainer>
  )
}

export default QRScanner

const ScannerContainer = styled.div`
  position: relative;
`

const DeviceSelect = styled(Select)`
  position: absolute;
  bottom: 5px;
`
