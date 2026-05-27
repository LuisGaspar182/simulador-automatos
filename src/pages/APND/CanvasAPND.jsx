import { useRef, useEffect, useState } from 'react'
import { Stage, Layer, Circle, Text, Arrow, Group } from 'react-konva'
import {
  pontoNaBorda,
  calcularCurvaBezier,
  pontosSelfLoop,
  curvaturaNecessaria,
} from '../../utils/canvasGeometry'
import styles from './CanvasAPND.module.css'

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

// Agrupa transições por par (origem, destino) e formata rótulos "símbolo,topo/empilhar"
// No APND: transicoes[origem][chave] é um ARRAY de resultados
function agruparArestas(apnd) {
  const mapa = {}
  for (const [origem, trans] of Object.entries(apnd.transicoes)) {
    for (const [chave, resultados] of Object.entries(trans)) {
      for (const resultado of resultados) {
        const destino = resultado.estado
        const k = `${origem}|${destino}`
        if (!mapa[k]) mapa[k] = { origem, destino, rotulos: [] }
        const [simbolo, topo] = chave.split(',')
        const emp = resultado.empilhar === '' ? 'ε' : resultado.empilhar
        mapa[k].rotulos.push(`${simbolo},${topo}/${emp}`)
      }
    }
  }
  return Object.values(mapa)
}

export default function CanvasAPND({
  apnd,
  layout,
  estadosAtivos,   // array de strings (múltiplos estados podem estar ativos)
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

  const arestas = agruparArestas(apnd)

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

            // Verifica bidirecionalidade para curvar a seta
            const temDireto = Object.values(apnd.transicoes[origem] ?? {}).some(res =>
              res.some(r => r.estado === destino)
            )
            const temInverso = Object.values(apnd.transicoes[destino] ?? {}).some(res =>
              res.some(r => r.estado === origem)
            )
            const bidir = origem !== destino && temDireto && temInverso
            const outrasPos = apnd.estados
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
          {apnd.estados.map(estado => {
            const pos = layout[estado]
            if (!pos) return null

            const eAtivo = estadosAtivos.includes(estado)
            const eOrigem = estado === origemTransicao
            const eFinal = apnd.estadosFinais.includes(estado)
            const eInicial = estado === apnd.estadoInicial

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
