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
  const stageRef = useRef(null)
  const [largura, setLargura] = useState(600)
  const [altura, setAltura] = useState(500)

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width
      setLargura(w)
      setAltura(w < 640 ? 280 : 500)
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // ── Viewport (pan + zoom) ────────────────────────────────────────────────
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 })
  const vpRef = useRef({ x: 0, y: 0, scale: 1 })
  function applyViewport(v) { vpRef.current = v; setViewport(v) }

  const panRef = useRef(null)
  const pinchRef = useRef(null)
  const mousePanRef = useRef(null)

  function toCanvas(sx, sy) {
    const v = vpRef.current
    return { x: (sx - v.x) / v.scale, y: (sy - v.y) / v.scale }
  }
  function d2(a, b) { return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY) }
  function c2(a, b) { return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 } }

  function handleWheel(e) {
    e.evt.preventDefault()
    const stage = stageRef.current; if (!stage) return
    const ptr = stage.getPointerPosition()
    const v = vpRef.current
    const dir = e.evt.deltaY < 0 ? 1 : -1
    const newScale = Math.max(0.2, Math.min(4, v.scale * (dir > 0 ? 1.1 : 1 / 1.1)))
    const pt = { x: (ptr.x - v.x) / v.scale, y: (ptr.y - v.y) / v.scale }
    applyViewport({ scale: newScale, x: ptr.x - pt.x * newScale, y: ptr.y - pt.y * newScale })
  }

  function handleTouchStart(e) {
    const t = e.evt.touches
    if (t.length === 2) {
      pinchRef.current = {
        dist: d2(t[0], t[1]), ...c2(t[0], t[1]),
        vpX: vpRef.current.x, vpY: vpRef.current.y, vpScale: vpRef.current.scale,
      }
      panRef.current = null
    } else if (t.length === 1 && e.target === stageRef.current) {
      panRef.current = {
        startX: t[0].clientX, startY: t[0].clientY,
        vpX: vpRef.current.x, vpY: vpRef.current.y,
      }
    }
  }

  function handleTouchMove(e) {
    e.evt.preventDefault()
    const t = e.evt.touches
    if (t.length === 2 && pinchRef.current) {
      const p = pinchRef.current
      const newDist = d2(t[0], t[1])
      const newC = c2(t[0], t[1])
      const newScale = Math.max(0.2, Math.min(4, p.vpScale * (newDist / p.dist)))
      const pt = { x: (p.x - p.vpX) / p.vpScale, y: (p.y - p.vpY) / p.vpScale }
      applyViewport({
        scale: newScale,
        x: p.x - pt.x * newScale + (newC.x - p.x),
        y: p.y - pt.y * newScale + (newC.y - p.y),
      })
    } else if (t.length === 1 && panRef.current) {
      applyViewport({
        ...vpRef.current,
        x: panRef.current.vpX + (t[0].clientX - panRef.current.startX),
        y: panRef.current.vpY + (t[0].clientY - panRef.current.startY),
      })
    }
  }

  function handleTouchEnd(e) {
    if (e.evt.touches.length < 2) pinchRef.current = null
    if (e.evt.touches.length === 0) panRef.current = null
  }

  function handleMouseDown(e) {
    if (e.target === stageRef.current) {
      const pos = stageRef.current.getPointerPosition()
      mousePanRef.current = { startX: pos.x, startY: pos.y, vpX: vpRef.current.x, vpY: vpRef.current.y, moved: false }
    }
  }
  function handleMouseMove() {
    if (!mousePanRef.current) return
    const pos = stageRef.current?.getPointerPosition(); if (!pos) return
    const dx = pos.x - mousePanRef.current.startX
    const dy = pos.y - mousePanRef.current.startY
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) mousePanRef.current.moved = true
    if (mousePanRef.current.moved) {
      applyViewport({ ...vpRef.current, x: mousePanRef.current.vpX + dx, y: mousePanRef.current.vpY + dy })
    }
  }
  function handleMouseUp() { mousePanRef.current = null }

  function handleCliqueStage(e) {
    if (e.target !== stageRef.current) return
    if (mousePanRef.current?.moved) return
    const pos = stageRef.current.getPointerPosition()
    onClicarVazio(toCanvas(pos.x, pos.y))
  }

  const arestas = agruparArestas(apnd)

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{ cursor: CURSORES[modo] ?? 'default', touchAction: 'none' }}
    >
      <button
        className={styles.resetView}
        onClick={() => applyViewport({ x: 0, y: 0, scale: 1 })}
        title="Restaurar vista"
      >
        ⌖
      </button>
      <Stage
        ref={stageRef}
        width={largura}
        height={altura}
        onClick={handleCliqueStage}
        onTap={handleCliqueStage}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Layer>
          <Group x={viewport.x} y={viewport.y} scaleX={viewport.scale} scaleY={viewport.scale}>
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

              const temDireto = Object.values(apnd.transicoes[origem] ?? {})
                .some(res => res.some(r => r.estado === destino))
              const temInverso = Object.values(apnd.transicoes[destino] ?? {})
                .some(res => res.some(r => r.estado === origem))
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

              const corFundo = eAtivo ? COR_ESTADO_ATIVO : eOrigem ? COR_ESTADO_ORIGEM : COR_ESTADO
              const corTexto = eAtivo ? COR_TEXTO_ATIVO : COR_TEXTO_NORMAL

              return (
                <Group
                  key={`estado-${estado}`}
                  x={pos.x}
                  y={pos.y}
                  draggable={modo === 'selecionar'}
                  onDragEnd={e => onMoverEstado(estado, { x: e.target.x(), y: e.target.y() })}
                  onClick={e => { e.cancelBubble = true; onClicarEstado(estado) }}
                  onTap={e => { e.cancelBubble = true; onClicarEstado(estado) }}
                  onDblClick={e => { e.cancelBubble = true; onDuploCliqueEstado(estado) }}
                  onDblTap={e => { e.cancelBubble = true; onDuploCliqueEstado(estado) }}
                >
                  <Circle radius={RAIO} fill={corFundo} stroke={COR_BORDA_ESTADO} strokeWidth={2} />
                  {eFinal && (
                    <Circle radius={RAIO - 5} fill="transparent" stroke={COR_BORDA_ESTADO} strokeWidth={1.5} listening={false} />
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
          </Group>
        </Layer>
      </Stage>
    </div>
  )
}
