function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <hemisphereLight intensity={0.3} color="#dbeafe" groundColor="#020617" />
      <directionalLight position={[5, 4, 3]} intensity={1.3} />
      <pointLight position={[-3.5, 1.4, -2]} intensity={0.35} color="#7dd3fc" />
    </>
  );
}

export default SceneLighting;

