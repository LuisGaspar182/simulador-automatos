import { useRef, useEffect, useState } from 'react'
import { Stage, Layer, Circle, Text, Arrow, Group } from 'react-konva'
import {
  pontoNaBorda,
  calcularCurvaBezier,
  pontosSelfLoop,
  ehBidirecional,
} from '../../utils/canvasGeometry'
import styles from './CanvasAFD.module.css'

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

// Agrupa as transições por par (origem, destino), consolidando os símbolos de cada aresta
function agruparArestas(afd) {
  const mapa = {}
  for (const [origem, trans] of Object.entries(afd.transicoes)) {
    for (const [simbolo, destino] of Object.entries(trans)) {
      const chave = `${origem}|${destino}`
      if (!mapa[chave]) mapa[chave] = { origem, destino, simbolos: [] }
      mapa[chave].simbolos.push(simbolo)
    }
  }
  return Object.values(mapa)
}

export default function CanvasAFD({
  afd,
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

  const arestas = agruparArestas(afd)

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{ cursor: CURSORES[modo] ?? 'default' }}
    >
      <Stage width={largura} height={ALTURA} onClick={handleCliqueStage}>
        <Layer>
          {/* Arestas */}
          {arestas.map(({ origem, destino, simbolos }) => {
            const posOrigem = layout[origem]
            const posDestino = layout[destino]
            if (!posOrigem || !posDestino) return null

            const rotulo = simbolos.join(', ')

            if (origem === destino) {
              const pts = pontosSelfLoop(posOrigem, RAIO)
              const labelX = posOrigem.x - 14
              const labelY = posOrigem.y - RAIO * 3.8
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
                    x={labelX}
                    y={labelY}
                    width={28}
                    align="center"
                    text={rotulo}
                    fontSize={13}
                    fill={COR_ARESTA}
                  />
                </Group>
              )
            }

            const bidir = ehBidirecional(afd, origem, destino)
            const curvatura = bidir ? 45 : 0

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
                    x={mx - 14}
                    y={my - 18}
                    width={28}
                    align="center"
                    text={rotulo}
                    fontSize={13}
                    fill={COR_ARESTA}
                  />
                </Group>
              )
            }

            // Transição bidirecional — curva
            const cp = calcularCurvaBezier(posOrigem, posDestino, curvatura)
            const inicio = pontoNaBorda(cp, posOrigem, RAIO)
            const fim = pontoNaBorda(cp, posDestino, RAIO)
            // Ponto médio na curva bezier (t=0.5, cubic com cp duplicado)
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
                  x={lx - 14}
                  y={ly - 18}
                  width={28}
                  align="center"
                  text={rotulo}
                  fontSize={13}
                  fill={COR_ARESTA}
                />
              </Group>
            )
          })}

          {/* Estados */}
          {afd.estados.map(estado => {
            const pos = layout[estado]
            if (!pos) return null

            const eAtivo = estado === estadoAtivo
            const eOrigem = estado === origemTransicao
            const eFinal = afd.estadosFinais.includes(estado)
            const eInicial = estado === afd.estadoInicial

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
