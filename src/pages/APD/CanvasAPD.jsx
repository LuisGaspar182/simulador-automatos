import { useRef, useEffect, useState } from 'react'
import { Stage, Layer, Circle, Text, Arrow, Group } from 'react-konva'
import {
  pontoNaBorda,
  calcularCurvaBezier,
  pontosSelfLoop,
  curvaturaNecessaria,
} from '../../utils/canvasGeometry'
import styles from './CanvasAPD.module.css'

const RAIO = 30
const ALTURA = 500

const COR_ESTADO = '#ffffff'
const COR_ESTADO_ATIVO = '#2563eb'
const COR_ESTADO_ORIGEM = '#d97706'
const COR_BORDA_ESTADO = '#1a1a1a'
const COR_TEXTO_NORMAL = '#1a1a1a'
const COR_TEXTO_ATIVO = '#ffffff'
const COR_ARESTA = '#555555'
const COR_SETA_INICIAL = '#1a1a1a'

const CURSORES = {
  selecionar: 'default',
  adicionarEstado: 'crosshair',
  adicionarTransicao: 'pointer',
  removerEstado: 'pointer',
}

// Agrupa as transições por par (origem, destino) e formata os rótulos como "símbolo,topo/empilhar"
function agruparArestas(apd) {
  const mapa = {}
  for (const [origem, trans] of Object.entries(apd.transicoes)) {
    for (const [chave, resultado] of Object.entries(trans)) {
      const destino = resultado.estado
      const k = `${origem}|${destino}`
      if (!mapa[k]) mapa[k] = { origem, destino, rotulos: [] }
      const [simbolo, topo] = chave.split(',')
      const emp = resultado.empilhar === '' ? 'ε' : resultado.empilhar
      mapa[k].rotulos.push(`${simbolo},${topo}/${emp}`)
    }
  }
  return Object.values(mapa)
}

export default function CanvasAPD({
  apd,
  layout,
  estadoAtivo,
  modo,
  origemTransicao,
  onMoverEstado,
  onClicarEstado,
  onClicarVazio,
  onDuploCliqueEstado,
}) {
  const containerRef = useRef(null)
  const [largura, setLargura] = useState(600)

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(entries => {
      setLargura(entries[0].contentRect.width)
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  function handleCliqueStage(e) {
    if (e.target === e.target.getStage()) {
      const pos = e.target.getStage().getPointerPosition()
      onClicarVazio(pos)
    }
  }

  const arestas = agruparArestas(apd)

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{ cursor: CURSORES[modo] ?? 'default' }}
    >
      <Stage width={largura} height={ALTURA} onClick={handleCliqueStage}>
        <Layer>
          {/* Arestas */}
          {arestas.map(({ origem, destino, rotulos }) => {
            const posOrigem = layout[origem]
            const posDestino = layout[destino]
            if (!posOrigem || !posDestino) return null

            const rotulo = rotulos.join('\n')
            const linhas = rotulos.length

            if (origem === destino) {
              const pts = pontosSelfLoop(posOrigem, RAIO)
              // Posiciona o bloco de texto logo acima do pico do arco (RAIO * 3.2)
              // Cada linha tem ~13px; subtrai a altura total para que o texto fique acima do loop
              const lx = posOrigem.x - 45
              const ly = posOrigem.y - RAIO * 3.2 - linhas * 13 - 5
              return (
                <Group key={`aresta-${origem}|${destino}`}>
                  <Arrow
                    points={pts}
                    bezier={true}
                    stroke={COR_ARESTA}
                    fill={COR_ARESTA}
                    strokeWidth={1.5}
                    pointerLength={7}
                    pointerWidth={6}
                  />
                  <Text
                    x={lx}
                    y={ly}
                    width={90}
                    align="center"
                    text={rotulo}
                    fontSize={11}
                    fill={COR_ARESTA}
                  />
                </Group>
              )
            }

            const temDireto = Object.values(apd.transicoes[origem] ?? {}).some(t => t.estado === destino)
            const temInverso = Object.values(apd.transicoes[destino] ?? {}).some(t => t.estado === origem)
            const bidir = origem !== destino && temDireto && temInverso
            const outrasPos = apd.estados
              .filter(e => e !== origem && e !== destino)
              .map(e => layout[e])
              .filter(Boolean)
            const desvio = curvaturaNecessaria(posOrigem, posDestino, outrasPos, RAIO)
            const curvatura = bidir ? 45 : desvio

            if (curvatura === 0) {
              const inicio = pontoNaBorda(posDestino, posOrigem, RAIO)
              const fim = pontoNaBorda(posOrigem, posDestino, RAIO)
              const mx = (inicio.x + fim.x) / 2
              const my = (inicio.y + fim.y) / 2
              return (
                <Group key={`aresta-${origem}|${destino}`}>
                  <Arrow
                    points={[inicio.x, inicio.y, fim.x, fim.y]}
                    stroke={COR_ARESTA}
                    fill={COR_ARESTA}
                    strokeWidth={1.5}
                    pointerLength={7}
                    pointerWidth={6}
                  />
                  <Text
                    x={mx - 45}
                    y={my + 6}
                    width={90}
                    align="center"
                    text={rotulo}
                    fontSize={11}
                    fill={COR_ARESTA}
                  />
                </Group>
              )
            }

            // Transição bidirecional ou com desvio — curva de Bezier
            const cp = calcularCurvaBezier(posOrigem, posDestino, curvatura)
            const inicio = pontoNaBorda(cp, posOrigem, RAIO)
            const fim = pontoNaBorda(cp, posDestino, RAIO)
            const lx = 0.125 * inicio.x + 0.75 * cp.x + 0.125 * fim.x
            const ly = 0.125 * inicio.y + 0.75 * cp.y + 0.125 * fim.y
            return (
              <Group key={`aresta-${origem}|${destino}`}>
                <Arrow
                  points={[inicio.x, inicio.y, cp.x, cp.y, cp.x, cp.y, fim.x, fim.y]}
                  bezier={true}
                  stroke={COR_ARESTA}
                  fill={COR_ARESTA}
                  strokeWidth={1.5}
                  pointerLength={7}
                  pointerWidth={6}
                />
                <Text
                  x={lx - 45}
                  y={ly - 10 - (linhas - 1) * 6}
                  width={90}
                  align="center"
                  text={rotulo}
                  fontSize={11}
                  fill={COR_ARESTA}
                />
              </Group>
            )
          })}

          {/* Estados */}
          {apd.estados.map(estado => {
            const pos = layout[estado]
            if (!pos) return null

            const eAtivo = estado === estadoAtivo
            const eOrigem = estado === origemTransicao
            const eFinal = apd.estadosFinais.includes(estado)
            const eInicial = estado === apd.estadoInicial

            const corFundo = eAtivo
              ? COR_ESTADO_ATIVO
              : eOrigem
              ? COR_ESTADO_ORIGEM
              : COR_ESTADO
            const corTexto = eAtivo ? COR_TEXTO_ATIVO : COR_TEXTO_NORMAL

            return (
              <Group
                key={`estado-${estado}`}
                x={pos.x}
                y={pos.y}
                draggable={modo === 'selecionar'}
                onDragEnd={e => onMoverEstado(estado, { x: e.target.x(), y: e.target.y() })}
                onClick={e => {
                  e.cancelBubble = true
                  onClicarEstado(estado)
                }}
                onDblClick={e => {
                  e.cancelBubble = true
                  onDuploCliqueEstado(estado)
                }}
              >
                <Circle
                  radius={RAIO}
                  fill={corFundo}
                  stroke={COR_BORDA_ESTADO}
                  strokeWidth={2}
                />
                {eFinal && (
                  <Circle
                    radius={RAIO - 5}
                    fill="transparent"
                    stroke={COR_BORDA_ESTADO}
                    strokeWidth={1.5}
                    listening={false}
                  />
                )}
                <Text
                  text={estado}
                  fontSize={14}
                  fontStyle="bold"
                  fill={corTexto}
                  width={RAIO * 2}
                  height={RAIO * 2}
                  x={-RAIO}
                  y={-RAIO}
                  align="center"
                  verticalAlign="middle"
                  listening={false}
                />
                {eInicial && (
                  <Arrow
                    points={[-RAIO - 36, 0, -RAIO, 0]}
                    stroke={COR_SETA_INICIAL}
                    fill={COR_SETA_INICIAL}
                    strokeWidth={2}
                    pointerLength={7}
                    pointerWidth={6}
                    listening={false}
                  />
                )}
              </Group>
            )
          })}
        </Layer>
      </Stage>
    </div>
  )
}
