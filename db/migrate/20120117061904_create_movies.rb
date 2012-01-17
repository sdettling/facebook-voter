class CreateMovies < ActiveRecord::Migration
  def change
    create_table :movies do |t|
      t.string :name
      t.string :slug
      t.string :url1
      t.string :url2
      t.string :director
      t.string :cast
      t.string :synopsis

      t.timestamps
    end
  end
end
