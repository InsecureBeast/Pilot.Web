namespace DocumentRender
{
    public class Tile
    {
        /// <summary> Номер страницы в документе </summary>
        public int PageNum { get; set; }
        /// <summary> Отступ тайла от верхней границы страницы в пикселях </summary>
        public int Top { get; set; }
        /// <summary> Отступ тайла от левой границы страницы в пикслях </summary>
        public int Left { get; set; }
        /// <summary> Ширина тайла </summary>
        public int Width { get; set; }
        /// <summary> Высота тайла </summary>
        public int Height { get; set; }
        /// <summary> Масштаб </summary>
        public double Scale { get; set; }
    }
}