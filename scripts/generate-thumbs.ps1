Add-Type -AssemblyName System.Drawing

$sourceDir = Join-Path $PSScriptRoot "..\public\rpl-photos"
$destDir = Join-Path $PSScriptRoot "..\public\rpl-photos\thumbs"

if (!(Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir | Out-Null
}

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encoder = [System.Drawing.Imaging.Encoder]::Quality
$encoderParameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, [long]80)

Get-ChildItem -Path $sourceDir -Filter *.jpg | ForEach-Object {
    $srcPath = $_.FullName
    $destPath = Join-Path $destDir $_.Name
    
    $stream = [System.IO.File]::OpenRead($srcPath)
    $img = [System.Drawing.Image]::FromStream($stream)
    
    $targetWidth = 600
    $targetHeight = [int]($img.Height * ($targetWidth / $img.Width))
    
    $thumb = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
    $g = [System.Drawing.Graphics]::FromImage($thumb)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($img, 0, 0, $targetWidth, $targetHeight)
    
    $g.Dispose()
    $img.Dispose()
    $stream.Dispose()
    
    $thumb.Save($destPath, $jpegCodec, $encoderParameters)
    $thumb.Dispose()
    Write-Host "Created thumb for $($_.Name)"
}
Write-Host "All thumbnails generated successfully."
