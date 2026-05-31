$mappings = @(
  @{ SrcDir='a7022864-fb78-4a77-b135-893511256259'; SrcPrefix='ajisai'; DestPrefix='hydrangea' },
  @{ SrcDir='a7022864-fb78-4a77-b135-893511256259'; SrcPrefix='bara'; DestPrefix='rose' },
  @{ SrcDir='a7022864-fb78-4a77-b135-893511256259'; SrcPrefix='sakura'; DestPrefix='sakura' },
  @{ SrcDir='a7022864-fb78-4a77-b135-893511256259'; SrcPrefix='kosumos'; DestPrefix='cosmos' },
  @{ SrcDir='a7022864-fb78-4a77-b135-893511256259'; SrcPrefix='tsutsuji'; DestPrefix='azalea' },
  @{ SrcDir='6ca8f225-c5f6-4387-bd43-609ee468d641'; SrcPrefix='nanohana'; DestPrefix='nanohana' },
  @{ SrcDir='6ca8f225-c5f6-4387-bd43-609ee468d641'; SrcPrefix='yuri'; DestPrefix='lily' },
  @{ SrcDir='6ca8f225-c5f6-4387-bd43-609ee468d641'; SrcPrefix='pansy'; DestPrefix='pansy' },
  @{ SrcDir='6ca8f225-c5f6-4387-bd43-609ee468d641'; SrcPrefix='carnation'; DestPrefix='carnation' },
  @{ SrcDir='6ca8f225-c5f6-4387-bd43-609ee468d641'; SrcPrefix='tsubaki'; DestPrefix='camellia' },
  @{ SrcDir='8453f71b-0589-470d-abc0-0859d8dbd8f8'; SrcPrefix='kyuri'; DestPrefix='cucumber' },
  @{ SrcDir='8453f71b-0589-470d-abc0-0859d8dbd8f8'; SrcPrefix='ichigo'; DestPrefix='strawberry' },
  @{ SrcDir='8453f71b-0589-470d-abc0-0859d8dbd8f8'; SrcPrefix='kabocha'; DestPrefix='pumpkin' },
  @{ SrcDir='8453f71b-0589-470d-abc0-0859d8dbd8f8'; SrcPrefix='okura'; DestPrefix='okra' },
  @{ SrcDir='8453f71b-0589-470d-abc0-0859d8dbd8f8'; SrcPrefix='ringo'; DestPrefix='apple' },
  @{ SrcDir='8453f71b-0589-470d-abc0-0859d8dbd8f8'; SrcPrefix='mikan'; DestPrefix='mandarin' },
  @{ SrcDir='8453f71b-0589-470d-abc0-0859d8dbd8f8'; SrcPrefix='broccoli'; DestPrefix='broccoli' }
)
$destBase = 'C:\Users\basst\.gemini\antigravity\scratch\tsubomi-learning\assets'
$srcBase = 'C:\Users\basst\.gemini\antigravity\brain'

foreach ($m in $mappings) {
  $budFiles = Get-ChildItem -Path "$srcBase\$($m.SrcDir)\$($m.SrcPrefix)_bud_*.png" -ErrorAction SilentlyContinue
  if ($budFiles -and $budFiles.Count -gt 0) {
    Copy-Item $budFiles[0].FullName -Destination "$destBase\$($m.DestPrefix)_bud.png" -Force
  }
  
  $flowerFiles = Get-ChildItem -Path "$srcBase\$($m.SrcDir)\$($m.SrcPrefix)_flower_*.png" -ErrorAction SilentlyContinue
  if ($flowerFiles -and $flowerFiles.Count -gt 0) {
    Copy-Item $flowerFiles[0].FullName -Destination "$destBase\$($m.DestPrefix)_flower.png" -Force
  }
}
Write-Output "Copy complete."
